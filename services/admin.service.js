import User from '../models/user.model';
import Workflow from '../models/workflow.model';
import { createPathIfNotExists, generateHex, getText } from '../utils/helperFunc';
import fs from 'fs';
import path from 'path';
import Document from '../models/document.model';
import { removePineconeData, run } from '../utils/pinecone-helper';
import { getProfileInfo } from '../utils/getProfileInfo';

/**
 * Remove user by ID
 * @param {string} userId - userId for deletion
 * @returns {Promise<User>}
 */
export const removeUserById = async (userId) => {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getAllUser = async () => {
  try {
    return await User.find();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Remove users by IDs
 * @param {array} userIds - userIds for deletion
 * @returns {Promise<User>}
 */
export const removeUserByIds = async (userIds) => {
  try {
    return await User.deleteMany({ _id: { $in: userIds } });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Update permission
 * @param {string} userId - UserId for update permission
 * @param {array <string>} permission - Permission for updates
 * @returns {Promise<User>}
 */
export const updateRoleById = async (userId, role) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 'User not found with that Id';
    user.role = role;
    return await user.save();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createFile = async (file, save_path = process.env.DOCPATH) => {
  /** Save File to Local */
  createPathIfNotExists(save_path);
  const randomFileName = generateHex();
  await fs
    .createReadStream(file.filepath)
    .pipe(
      fs.createWriteStream(path.resolve(process.env.DOCPATH + randomFileName + '.' + file.originalFilename.split('.').pop()))
    );

  console.log('------------new file created----------');

  /** Save File to DB */
  const newDocument = {
    name: file.originalFilename,
    type: 0,
    hex: randomFileName,
  };
  await Document.create(newDocument);
  return randomFileName;
};

/**
 * Save File to Local and DB
 * @param {File} file - File Object need to save
 * @param {string} filename - file name to save
 */
export const saveFile = async (file) => {
  try {
    console.log('saveFile called ----------');

    const randomFileName = await createFile(file);

    return await run(path.resolve(process.env.DOCPATH + randomFileName + '.' + file.originalFilename.split('.').pop()));
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const ingestFileData = async (file, { sid, core }, uid) => {
  try {
    return await run(file, null, core, sid, uid);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const scrapURL = async (url, { sid, core }, uid) => {
  try {
    return await run(null, url, core, sid, uid);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const uploadPDFAndGetInfo = async (files) => {
  try {
    let texts = '';
    for (let i = 0; i < files.length; i++) {
      const randomFileName = await createFile(files[i]);
      texts += await getText(
        path.resolve(process.env.DOCPATH + randomFileName + '.' + files[i].originalFilename.split('.').pop())
      );
    }
    const results = await getProfileInfo(texts);
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const uploadPDFAndGetInfo1 = async (files, userId) => {
  try {
    const save_path = `${process.env.C_DOC_PATH}${userId}/`;
    const file_name = await createFile(files[0], save_path);
    const texts = await getText(
      path.resolve(process.env.C_DOC_PATH + file_name + '.' + files[0].originalFilename.split('.').pop())
    );
    const results = await getProfileInfo(texts);
    return [`${save_path}${file_name}`, results];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const removePinecones = async (del_flag) => {
  try {
    return await removePineconeData(del_flag);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const createWorkflows = async ({ name, description, prompt, userId }) => {
  try {
    const new_workflow = {
      name,
      description,
      prompt,
      type: 1,
      userId,
    };
    return (await Workflow.create(new_workflow)).populate('userId');
  } catch (err) {
    console.log('create workflow---', err);
    throw err;
  }
};

export const getWorkflows = async () => {
  try {
    return await Workflow.find();
  } catch (err) {
    console.log('get workflow---', err);
    throw err;
  }
};

export const delWorkflow = async ({ id }) => {
  try {
    return await Workflow.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateWorkflows = async ({ name, description, prompt, id }) => {
  try {
    return await Workflow.findByIdAndUpdate(id, { name, description, prompt });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getDocumentsList = async () => {
  try {
    return await Document.find();
  } catch (err) {
    console.log('get all documents---', err);
    throw err;
  }
};
