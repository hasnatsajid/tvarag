const formidable = require('formidable');
const s_path = require('path');
import {
  removeUserById,
  removeUserByIds,
  saveFile,
  ingestFileData,
  updateRoleById,
  scrapURL,
  removePinecones,
  uploadPDFAndGetInfo,
  uploadPDFAndGetInfo1,
  createWorkflows,
  getWorkflows,
  delWorkflow,
  getDocumentsList,
  getAllUser,
  updateWorkflows,
} from '../services/admin.service';

export const removeUser = async (req, res) => {
  const userId = req.body.userId;
  return await removeUserById(userId);
};

export const getUsers = async (req, res) => {
  return await getAllUser();
};

export const removeUsers = async (req, res) => {
  const userIds = req.body.userIds;
  return await removeUserByIds(userIds);
};

export const updateRole = async (req, res) => {
  const userId = req.body.userId;
  const newRoles = req.body.roles;
  return await updateRoleById(userId, newRoles);
};

export const ingestFile = async (req) => {
  return await ingestFileData(req.file, req.body, req.user._id);
};

export const ingestURL = async (req, res) => {
  return await scrapURL(req.body.url, req.body, req.user._id);
};

export const uploadProfilePDF = async (req, res) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const result = await uploadPDFAndGetInfo(files.profile);
      resolve(result);
    });
  });
};

export const uploadProfilePDF1 = async (req, userId) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const result = await uploadPDFAndGetInfo1(files.profile, userId);
      resolve(result);
    });
  });
};

export const removePineconeAll = async (req, res) => {
  const del_flag = req.body.del_flag;
  return await removePinecones(del_flag);
};

export const createWorkflow = async (req, res) => {
  return await createWorkflows(req.body);
};

export const getWorkflow = async (req, res) => {
  return await getWorkflows();
};

export const deleteWorkflow = async (req, res) => {
  return await delWorkflow(req.body);
};

export const updateWorkflow = async (req, res) => {
  return await updateWorkflows(req.body);
};

export const getDocuments = async (req, res) => {
  return await getDocumentsList();
};
