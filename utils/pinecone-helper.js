import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '../config/pinecone';
import { encode } from 'gpt-tokenizer';
import { readFile, getTextFromURL } from './helperFunc';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { loadQAChain } from 'langchain/chains';
import { I_CAN_PROMPT } from './prompt';
import { PromptTemplate } from '@langchain/core/prompts';
import Document from '../models/document.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const initPinecone = async () => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log('Pinecone database connected successfully');
    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
};

export const run = async (file, url = null, core, sid, uid) => {
  try {
    const pinecone = await initPinecone();
    let contents;
    if (!url) {
      contents = await readFile(file.path);
    } else {
      contents = await getTextFromURL(url);
    }
    if (contents) {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 3000,
        chunkOverlap: 500,
      });

      const docs = await textSplitter.splitText(contents);

      let token_count = 0;
      docs.map((doc, idx) => {
        token_count += encode(doc).length;
      });

      const metadatas = docs.map(() => {
        return {
          source: url === null ? path.basename(file.path, path.extname(file.path)) : url,
          core: Number(core),
          sid: Number(sid),
          uid: uid.toString(),
        };
      });

      console.log('creating vector store...');
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();
      const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

      //embed the PDF documents
      const result = await PineconeStore.fromTexts(docs, metadatas, embeddings, {
        pineconeIndex: index,
        namespace: PINECONE_NAME_SPACE,
        textKey: 'text',
      });
      console.log('Ingest completed --------');
      const newDocument = {
        name: url ? url : file.filename,
        type: url ? 1 : 0,
        core: Number(core),
        sid: Number(sid),
        uid,
      };
      await Document.create(newDocument);

      console.log('Database saved in documents --------');
      return result;
    } else {
      console.log('No contents');
      return true;
    }
  } catch (error) {
    console.log('pinecone result error------------', error);
    throw new Error('Failed to ingest your data');
  }
};

/**
 * @function_name removePineconeData
 * @flag 1: del by all , id: del by id
 * @return none
 * @description delete pinecone database
 */

export const removePineconeData = async (del_flag) => {
  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    await index.namespace(PINECONE_NAME_SPACE).deleteAll();
    console.log('Pinecone data deleted --------');

    await Document.deleteMany({});
    console.log('All document data deleted --------');

    fs.rmSync('uploads/', { recursive: true });
    console.log('All file document was deleted --------');
    return true;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to delete pinecone data');
  }
};

export const removePineconeWithUserId = async ({ sid, uid }) => {
  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    await index.namespace(PINECONE_NAME_SPACE).deleteMany({ core: 0, sid, uid: uid.toString() });
    const documents = await Document.find({ sid, uid });
    await Document.deleteMany({ core: 0, uid, sid });
    console.log('users document data deleted in db --------');
    documents.map((item) => {
      console.log(item);
      fs.rmSync('uploads/' + item.name);
    });

    console.log('User file document was deleted --------');
    return true;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to delete pinecone data');
  }
};

export const delRecordWithMetadata = async () => {
  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    await index.namespace(PINECONE_NAME_SPACE).deleteMany({ core: 0 });
    return true;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to delete pinecone data' + error);
  }
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const getResponses = async ({ question }) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* Create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
    });

    // Get suitable docs
    const suitableDocs = await vectorStore.similaritySearch(sanitizedQuestion);
    console.log('suitableDocs is : ', suitableDocs);

    const chat_model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      modelName: 'gpt-3.5-turbo',
      verbose: true,
      streaming: true,
      // callbackManager: CallbackManager.fromHandlers({
      //   async handleLLMNewToken(token) {
      //     console.log(token);
      //   },
      // }),
    });

    // Create QA Chain
    const chain = loadQAChain(chat_model, {
      type: 'stuff',
      prompt: I_CAN_PROMPT,
      // outputParser: outputFixingParser,
    });

    const res = await chain.invoke({
      input_documents: suitableDocs,
      question: sanitizedQuestion,
    });

    const response = {
      text: res.text,
      sourceDocuments: suitableDocs,
    };

    return response;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

export const socketChat = async ({ payload }, socketCallback, socketEndCallback) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const { workflow, question, sid, userId, prompt } = payload;

  const query_text = workflow ? workflow.description : question;
  const sanitizedQuestion = query_text.trim().replaceAll('\n', ' ');

  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* Create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
    });

    // Get Core(admin) suitable docs
    const core_docs = await vectorStore.similaritySearch(sanitizedQuestion, 2, { core: 1 });

    // Get User suitable docs
    const filter = sid ? { core: 0, sid: Number(sid), uid: userId?.toString() } : { core: 0, uid: userId?.toString() };
    const user_docs = await vectorStore.similaritySearch(sanitizedQuestion, 2, filter);

    // All suitable docs
    const all_docs = core_docs.concat(user_docs);
    // console.log('all_doc_---', all_docs);
    console.log('core_doc_---', core_docs);
    console.log('user_doc_---', user_docs);
    console.log('prompt---', prompt);
    // Create QA Chain
    const chain = loadQAChain(
      new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.6,
        modelName: 'gpt-4',
        verbose: true,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token) {
              socketCallback(token);
              console.log({ token });
            },
          },
        ],
      }),
      {
        type: 'stuff',
        prompt: prompt ? PromptTemplate.fromTemplate(`${prompt}`) : I_CAN_PROMPT,
      }
    );

    const res = await chain.invoke({
      input_documents: all_docs,
      question: sanitizedQuestion,
    });

    const response = {
      text: res.text,
      sourceDocuments: all_docs,
    };
    socketEndCallback(response);
    return;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};
