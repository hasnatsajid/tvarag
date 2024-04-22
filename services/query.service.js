import Query from '../models/query.model';
import { removePineconeWithUserId } from '../utils/pinecone-helper';
/**
 * Create Query data
 * @param {string} content - query content
 * @param {string} userId - whose query
 * @returns {Promise<Query>}
 */
export const insertQuery = async (body, userId) => {
  try {
    const queries = await Query.findOne({ userId });
    if (body.isNew) {
      const newChatId = queries?.chats?.length ? queries?.chats[queries?.chats.length - 1].id + 1 : 1;
      const newChat = {
        id: newChatId,
        title: body.title,
        prompt: body.prompt,
        queries: [{ question_id: 1, question: body.question, solution: '' }],
      };
      if (queries) {
        queries.chats.push(newChat);
        const newQuery = new Query(queries);
        return await newQuery.save();
      } else {
        const new_query = {
          userId,
          chats: newChat,
        };
        const newQuery = new Query(new_query);
        return await newQuery.save();
      }
    } else {
      const myChat = queries.chats.find((chat) => chat.id == (body.sid ? body.sid : 0));
      if (myChat) {
        const quesriesLength = myChat.queries.length;
        const newQuestionId = quesriesLength ? myChat.queries[quesriesLength - 1].question_id + 1 : 1;
        myChat.queries = [
          ...myChat.queries,
          {
            question_id: newQuestionId,
            question: body.question,
            solution: '',
          },
        ];
        const index = queries.chats.indexOf(myChat);
        queries.chats[index] = myChat;
        const newQuery = new Query(queries);
        return await newQuery.save();
      } else {
        console.log('No record found with this chat id');
        return null;
      }
    }
  } catch (err) {
    console.log('insertError-------', err);
    throw new Error(err);
  }
};

export const setSolutions = async (body, userId) => {
  try {
    const queries = await Query.findOne({ userId });
    if (queries) {
      const my_chat = queries.chats.find((chat) => chat.id === body.c_id);
      if (my_chat) {
        const my_query = my_chat.queries.find((q) => q.question_id === body.q_id);
        if (my_query) {
          my_query.solution = body.content;
        }
      }
      const newQuery = new Query(queries);
      return await newQuery.save();
    } else {
      console.log('cannot set solution----');
      return false;
    }
  } catch (err) {
    console.log('chat/setSOlutions----', err);
    throw err;
  }
};

export const getQueriesAll = async (body, userId) => {
  try {
    const queries = await Query.findOne({ userId });
    let activeChats = queries?.chats ? queries.chats : [];
    activeChats = !activeChats ? [] : activeChats;
    return { chats: activeChats };
  } catch (err) {
    console.log('getQueriesAll----', err);
    throw err;
  }
};

export const delChat = async ({ id }, userId) => {
  try {
    const userQuery = await Query.findOne({ userId }).populate('user_id');

    let activePromptChats = userQuery.chats ? userQuery.chats : [];
    activePromptChats = !activePromptChats ? [] : activePromptChats;

    const isChatPresent = activePromptChats.find((chat) => chat.id == id);
    if (!isChatPresent) {
      return 'no chat';
    }
    const filteredChats = activePromptChats.filter((chat) => chat.id != id);
    userQuery.chats = filteredChats;

    const newUserQuery = new Query(userQuery);
    await newUserQuery.save();
    await removePineconeWithUserId({ sid: id, uid: userId });
    return { chats: filteredChats };
  } catch (err) {
    console.log('delChat----', err);
    throw err;
  }
};
