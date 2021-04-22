/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-18
 * @Company: Copyright 2021 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mccrudpg: crud base class/methods
 */

import { AuditLog, newAuditLog } from "@mconnect/mcauditlog";
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { DbConnect, DbConnectType, newDbMongo, } from "@mconnect/mcdb";
import {
    RoleServiceType, CheckAccessType, UserInfoType, TaskTypes, RoleFuncType,
    OkResponse, MessageObject, ActionParamsType, QueryParamsType, ProjectParamsType,
    SortParamsType, CrudParamsType, CrudOptionsType, EmailUserNameType,
} from "./types";
import { getParamsMessage, isEmptyObject, isEmail } from "./helper";
import { Model, Op } from "sequelize";

// const sequelize = require("sequelize");

export class Crud {
    protected crudModel: any;
    protected crudTable: string;
    protected auditModel: any;
    protected userModel: any;
    protected profileModel: any;
    protected sessionModel: any;
    protected verifyModel: any;
    protected roleModel: any;
    protected serviceModel: any;
    protected userInfo: UserInfoType;
    protected actionParams: Array<ActionParamsType>;
    protected recordIds: Array<string>;
    protected queryParams: QueryParamsType;
    protected projectParams: ProjectParamsType;
    protected sortParams: SortParamsType;
    protected token: string;
    protected taskType: string;

    // options
    protected skip: number;
    protected limit: number;
    protected maxQueryLimit: number;
    protected logAll: boolean;
    protected logCreate: boolean;
    protected logUpdate: boolean;
    protected logRead: boolean;
    protected logDelete: boolean;
    protected logLogin: boolean;
    protected logLogout: boolean;
    protected transLog: AuditLog;
    protected hashKey: string;
    protected usernameExistsMessage: string;
    protected emailExistsMessage: string;
    protected cacheExpire: number;
    // class/instance variables
    protected userId: string = "";
    protected isAdmin: boolean = false;
    protected isActive: boolean = false;
    protected createRecords: Array<object> = [];
    protected updateRecords: Array<object> = [];
    protected currentRecords: Array<object> = [];
    protected roleServices: Array<RoleServiceType> = [];

    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        // default values
        const userInfo: UserInfoType = {
            userId   : "",
            firstName: "",
            lastName : "",
            language : "en-US",
            loginName: "",
            token    : "",
            expire   : 0,
        };
        // properties initialization / constructor-values
        this.crudModel = params?.crudModel ? params.crudModel : null;
        this.crudTable = params?.crudTable ? params.crudTable : "";
        this.auditModel = params?.auditModel ? params.auditModel : null;
        this.sessionModel = params?.sessionModel ? params.sessionModel : null;
        this.userModel = params?.userModel ? params.userModel : null;
        this.profileModel = params?.profileModel ? params.profileModel : null;
        this.verifyModel = params?.verifyModel ? params.verifyModel : null;
        this.roleModel = params?.roleModel ? params.roleModel : null;
        this.serviceModel = params?.serviceModel ? params.serviceModel : null;
        this.userInfo = params?.userInfo ? params.userInfo : userInfo;
        this.actionParams = params?.actionParams ? params.actionParams : [];
        this.recordIds = params?.recordIds ? params.recordIds : [];
        this.queryParams = params?.queryParams ? params.queryParams : {};
        this.projectParams = params?.projectParams ? params.projectParams : {};
        this.sortParams = params?.sortParams ? params.sortParams : {};
        this.token = params?.token ? params.token : "";
        this.taskType = params?.taskType ? params.taskType : "";

        // options
        this.skip = options?.skip ? options.skip : 0;
        this.limit = options?.limit ? options.limit : 100000;
        this.maxQueryLimit = options?.maxQueryLimit ? options.maxQueryLimit : 100000;
        this.logAll = options?.logAll ? options.logAll : false;
        this.logCreate = options?.logCreate ? options.logCreate : false;
        this.logUpdate = options?.logUpdate ? options.logUpdate : false;
        this.logRead = options?.logRead ? options.logRead : false;
        this.logDelete = options?.logDelete ? options.logDelete : false;
        this.logLogin = options?.logLogin ? options.logLogin : false;
        this.logLogout = options?.logLogout ? options.logLogout : false;
        this.usernameExistsMessage = options?.usernameExistsMessage ? options.usernameExistsMessage : "username already exists";
        this.emailExistsMessage = options?.emailExistsMessage ? options.emailExistsMessage : "email already exists";
        this.cacheExpire = options?.cacheExpire ? options.cacheExpire : 300;
        this.hashKey = JSON.stringify({
            table        : this.crudModel.tableName,
            queryParams  : this.queryParams,
            projectParams: this.projectParams,
            sortParams   : this.sortParams,
        });
        // auditLog constructor / instance
        this.transLog = newAuditLog(this.auditModel);
    }

    // instance-methods
    validateCrudDb() {
        // Check/validate the model/db
        if (!this.crudModel) {
            return getResMessage("validateError", {
                message: "crudModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateUserDb() {
        // Check/validate the model/db
        if (!this.userModel) {
            return getResMessage("validateError", {
                message: "userModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateProfileDb() {
        // Check/validate the model/db
        if (!this.profileModel) {
            return getResMessage("validateError", {
                message: "profileModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateSessionDb() {
        // Check/validate the model/db
        if (!this.sessionModel) {
            return getResMessage("validateError", {
                message: "sessionModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateVerifyDb() {
        // Check/validate the model/db
        if (!this.verifyModel) {
            return getResMessage("validateError", {
                message: "verifyModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateAuditDb() {
        // Check/validate the model/db
        if (!this.auditModel) {
            return getResMessage("validateError", {
                message: "auditModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateServiceDb() {
        // Check/validate the model/db
        if (!this.serviceModel) {
            return getResMessage("validateError", {
                message: "serviceModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    validateRoleDb() {
        // Check/validate the model/db
        if (!this.roleModel) {
            return getResMessage("validateError", {
                message: "roleModel is required",
            });
        } else {
            return getResMessage("success", {
                message: "valid Db",
            });
        }
    }

    emailUsername(loginName: string): EmailUserNameType {
        if (isEmail(loginName)) {
            return {
                email   : loginName,
                username: "",
            };
        } else {
            return {
                email   : "",
                username: loginName,
            };
        }
    }

    // crud instance-methods

    // getCurrentRecords fetch all records, limited by this.limit, and this.skip, if applicable
    async getCurrentRecords(): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = await this.validateCrudDb();
            if (validDb.code !== "success") {
                return validDb;
            }
            const currentRecords = await this.crudModel.findAll({
                skip : this.skip,
                limit: this.limit,
            });

            if (currentRecords.length > 0) {
                // update crud instance value
                this.currentRecords = currentRecords;
                return getResMessage("success", {
                    message: "Current record(s) exists",
                });
            } else {
                return getResMessage("notFound", {
                    message: "Current record(s) not found.",
                });
            }
        } catch (e) {
            console.error(e);
            return getResMessage("notFound", {
                message: "Error finding current record(s)",
            });
        }
    }    // // getCurrentRecords fetch all records, by recordIds

    async getCurrentRecordsByIds(): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = await this.validateCrudDb();
            if (validDb.code !== "success") {
                return validDb;
            }
            const currentRecords = await this.crudModel.findAll({
                where: {
                    id: {[Op.in]: this.recordIds},
                }
            });

            if (currentRecords.length > 0 && currentRecords.length === this.recordIds.length) {
                // update crud instance value
                this.currentRecords = currentRecords;
                return getResMessage("success", {
                    message: "Current record(s) exists.",
                });
            } else if (currentRecords.length < this.recordIds.length) {
                return getResMessage("notFound", {
                    message: `Only ${currentRecords.length} out of ${this.recordIds.length} record(s) found`,
                });
            } else {
                return getResMessage("notFound", {
                    message: "Current record(s) not found.",
                });
            }
        } catch (e) {
            console.error(e);
            return getResMessage("notFound", {
                message: "Error finding current record(s)",
            });
        }
    }

    async getCurrentRecordsByParams(): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = await this.validateCrudDb();
            if (validDb.code !== "success") {
                return validDb;
            }
            const currentRecords = await this.crudModel.findAll({
                where: this.queryParams,
            });

            if (currentRecords.length > 0) {
                // update crud instance value
                this.currentRecords = currentRecords;
                return getResMessage("success", {
                    message: "Current record(s) exists.",
                });
            } else {
                return getResMessage("notFound", {
                    message: "Current record(s) not found.",
                });
            }
        } catch (e) {
            console.error(e);
            return getResMessage("notFound", {
                message: "Error finding current record(s).",
            });
        }
    }

    // getRoleServices method process and returns the permission to user / user-group for the specified service items
    async getRoleServices(groupId: string, serviceIds: Array<string>): Promise<Array<RoleServiceType>> {
        // serviceIds: for serviceCategory (record, coll/table, function, package, solution...)
        let roleServices: Array<RoleServiceType> = [];
        try {
            // validate models
            const validRoleDb = await this.validateRoleDb();
            if (validRoleDb.code !== "success") {
                return [];
            }
            const result = await this.roleModel.findAll({
                where: {
                    groupId  : groupId,
                    serviceId: {[Op.in]: serviceIds},
                    isActive : true,
                }
            });
            if (result.length > 0) {
                for (const rec of result) {
                    roleServices.push({
                        serviceId      : rec.serviceId,
                        groupId        : rec.groupId,
                        serviceCategory: rec.serviceCategory,
                        canRead        : rec.canRead,
                        canCreate      : rec.canCreate,
                        canUpdate      : rec.canUpdate,
                        canDelete      : rec.canDelete,
                    });
                }
            }
            return roleServices;
        } catch (e) {
            return roleServices;
        }
    }

    // checkAccess validate if current CRUD task is permitted based on defined/assigned roles
    async checkTaskAccess(userInfo: UserInfoType, recordIds: Array<string> = [],): Promise<ResponseMessage> {
        try {
            // validate models
            const validRoleDb = await this.validateRoleDb();
            if (validRoleDb.code !== "success") {
                return validRoleDb;
            }
            const validUserDb = await this.validateUserDb();
            if (validUserDb.code !== "success") {
                return validUserDb;
            }
            const validProfileDb = await this.validateProfileDb();
            if (validProfileDb.code !== "success") {
                return validProfileDb;
            }
            const validAccessDb = await this.validateSessionDb();
            if (validAccessDb.code !== "success") {
                return validAccessDb;
            }
            const validServiceDb = await this.validateServiceDb();
            if (validServiceDb.code !== "success") {
                return validServiceDb;
            }
            // perform crud-operation
            // get the accessKey information for the user
            const accessRes = await this.sessionModel.findOne({
                where: {
                    userId   : userInfo.userId,
                    token    : userInfo.token,
                    loginName: userInfo.loginName
                }
            });
            if (accessRes || accessRes !== null) {
                if (Date.now() > accessRes.expire) {
                    return getResMessage("tokenExpired", {message: "Access expired: please login to continue"});
                }
            } else {
                return getResMessage("unAuthorized", {message: "Unauthorized: please ensure that you are logged-in"});
            }

            // check current current-user status/info
            const userRes = await this.userModel.findOne({
                where: {
                    id      : userInfo.userId,
                    isActive: true,
                }
            });
            if (!userRes || userRes === null) {
                return getResMessage("unAuthorized", {message: "Unauthorized: user-profile information not found or inactive"});
            }
            const profileRes = await this.profileModel.findOne({
                where: {
                    userId  : userInfo.userId,
                    isActive: true,
                }
            });
            if (!profileRes || profileRes === null) {
                return getResMessage("unAuthorized", {message: "Unauthorized: user-profile information not found or inactive"});
            }

            // if all the above checks passed, check for role-services access by taskType
            // obtain tableName/tableId (id) from serviceTable (repo for all resources)
            const serviceRes = await this.serviceModel.findOne({where: {name: this.crudTable}});

            // # if permitted, include tableId and recordIds in serviceIds
            let tableId = "";
            let serviceIds = recordIds;
            if (serviceRes && (serviceRes.category.toLowerCase() === "collection" || "table")) {
                tableId = serviceRes.id;
                serviceIds.push(serviceRes.id);
            }

            let roleServices: Array<RoleServiceType> = [];
            if (serviceIds.length > 0) {
                roleServices = await this.getRoleServices(profileRes.groupId, serviceIds)
            }

            let permittedRes: CheckAccessType = {
                userId      : userRes.id,
                groupId     : profileRes.groupId,
                groupIds    : userRes.groupIds,
                isActive    : userRes.isActive,
                isAdmin     : userRes.isAdmin || false,
                roleServices: roleServices,
                tableId     : tableId,
            }
            return getResMessage("success", {value: permittedRes});
        } catch (e) {
            console.error("check-access-error: ", e);
            return getResMessage("unAuthorized", {message: e.message});
        }
    }

    // taskPermission method determines the access permission by owner, role/group (on coll/table or doc/record(s)) or admin
    // for various tasks: create/insert, update, delete/remove, read
    async taskPermission(taskType: TaskTypes): Promise<ResponseMessage> {
        // taskType: "create", "update", "delete"/"remove", "read"
        // permit task(crud): by owner, role/group (on coll/table or doc/record(s)) or admin
        try {
            // # validation access variables
            let taskPermitted = false,
                ownerPermitted = false,
                recordPermitted = false,
                collPermitted = false,
                isAdmin = false,
                isActive = false,
                userId = "",
                group = "",
                groups = [],
                tableId = "",
                roleServices = [];

            // check role-based access
            const accessRes = await this.checkTaskAccess(this.userInfo, this.recordIds);
            if (accessRes.code !== "success") {
                return accessRes;
            }

            // capture roleServices value
            // get access info value
            let accessInfo = accessRes.value;
            let accessUserId = accessInfo.userId;
            let recordIds: Array<string> = [];

            // determine records/documents ownership
            if (this.recordIds && this.recordIds.length > 0 && accessUserId && accessInfo.isActive) {
                recordIds = this.recordIds;
                const ownedRecs = await this.crudModel.findAll({
                    where: {
                        id       : {[Op.in]: this.recordIds},
                        createdBy: accessUserId
                    }
                });
                // check if the current-user owned all the current-documents (recordIds)
                if (ownedRecs.length === this.recordIds.length) {
                    ownerPermitted = true;
                }
            }
            isAdmin = accessInfo.isAdmin;
            isActive = accessInfo.isActive;
            roleServices = accessInfo.roleServices;
            userId = accessInfo.userId;
            group = accessInfo.group;
            groups = accessInfo.groups;
            tableId = accessInfo.tableId;

            // validate active status
            if (!isActive) {
                return getResMessage("unAuthorized", {message: "Account is not active. Validate active status"});
            }
            // validate roleServices permission, for non-admin users
            if (!isAdmin && roleServices.length < 1) {
                return getResMessage("unAuthorized", {message: "You are not authorized to perform the requested action/task"});
            }

            // filter the roleServices by categories ("collection | table" and "record or document")
            const collTabFunc = (item: RoleServiceType): boolean => {
                return (item.serviceCategory === tableId);
            }

            const recordFunc = (item: RoleServiceType): boolean => {
                return (recordIds.includes(item.serviceCategory));
            }

            let roleColls: Array<RoleServiceType> = [];
            let roleDocs: Array<RoleServiceType> = [];
            if (roleServices.length > 0) {
                roleColls = roleServices.filter(collTabFunc);
                roleDocs = roleServices?.filter(recordFunc);
            }

            // helper functions
            const canCreateFunc = (item: RoleServiceType): boolean => {
                return item.canCreate
            }

            const canUpdateFunc = (item: RoleServiceType): boolean => {
                return item.canUpdate;
            }

            const canDeleteFunc = (item: RoleServiceType): boolean => {
                return item.canDelete;
            }

            const canReadFunc = (item: RoleServiceType): boolean => {
                return item.canRead;
            }

            const roleUpdateFunc = (it1: string, it2: RoleServiceType): boolean => {
                return (it2.serviceId === it1 && it2.canUpdate);
            }

            const roleDeleteFunc = (it1: string, it2: RoleServiceType): boolean => {
                return (it2.serviceId === it1 && it2.canUpdate);
            }

            const roleReadFunc = (it1: string, it2: RoleServiceType): boolean => {
                return (it2.serviceId === it1 && it2.canUpdate);
            }

            const docFunc = (it1: string, roleFunc: RoleFuncType): boolean => {
                return roleDocs.some((it2: RoleServiceType) => roleFunc(it1, it2));
            }

            // taskType specific permission(s)
            if (!isAdmin && roleServices.length > 0) {
                switch (taskType) {
                    case TaskTypes.CREATE:
                    case TaskTypes.INSERT:
                        // collection/table level access | only tableName Id was included in serviceIds
                        if (roleColls.length > 0) {
                            collPermitted = roleColls.every(canCreateFunc);
                        }
                        break;
                    case TaskTypes.UPDATE:
                        // collection/table level access
                        if (roleColls.length > 0) {
                            collPermitted = roleColls.every(canUpdateFunc);
                        }
                        // document/record level access: all recordIds must have at least a match in the roleRecords
                        if (recordIds.length > 0) {
                            recordPermitted = recordIds.every(it1 => docFunc(it1, roleUpdateFunc));
                        }
                        break;
                    case TaskTypes.DELETE:
                    case TaskTypes.REMOVE:
                        // collection/table level access
                        if (roleColls.length > 0) {
                            collPermitted = roleColls.every(canDeleteFunc);
                        }
                        // document/record level access: all recordIds must have at least a match in the roleRecords
                        if (recordIds.length > 0) {
                            recordPermitted = recordIds.every(it1 => docFunc(it1, roleDeleteFunc));
                        }
                        break;
                    case TaskTypes.READ:
                        // collection/table level access
                        if (roleColls.length > 0) {
                            collPermitted = roleColls.every(canReadFunc);
                        }
                        // document/record level access: all recordIds must have at least a match in the roleRecords
                        if (recordIds.length > 0) {
                            recordPermitted = recordIds.every(it1 => docFunc(it1, roleReadFunc));
                        }
                        break;
                    default:
                        return getResMessage("unAuthorized", {message: "Unknown access type or access type not specified"});
                }
            }

            // overall access permitted
            taskPermitted = recordPermitted || collPermitted || ownerPermitted || isAdmin;
            const ok: OkResponse = {ok: taskPermitted};
            const value = {...ok, ...{isAdmin, isActive, userId, group, groups}};
            if (taskPermitted) {
                return getResMessage("success", {value: value, message: "action authorised / permitted"});
            } else {
                return getResMessage("unAuthorized", {
                    value  : ok,
                    message: "You are not authorized to perform the requested action/task"
                });
            }
        } catch (e) {
            const ok: OkResponse = {ok: false};
            return getResMessage("unAuthorized", {value: ok});
        }
    }

    async taskPermissionByParams(taskType: TaskTypes): Promise<ResponseMessage> {
        try {
            // ids of records to be deleted, from queryParams
            let recordIds: Array<string> = [];          // reset recordIds instance value
            if (this.currentRecords.length < 1) {
                return getResMessage("notFound", {message: "missing records, required to process permission"});
            }
            await this.currentRecords.forEach((item: any) => {
                recordIds.push(item.id);
            });
            this.recordIds = recordIds;
            return await this.taskPermission(taskType);
        } catch (e) {
            console.error("check-access-error: ", e);
            return getResMessage("unAuthorized", {message: e.message});
        }
    }

    // checkLoginStatus method checks if the user exists and has active login status/token
    async checkLoginStatus(): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = await this.validateUserDb()
            if (validDb.code !== "success") {
                return validDb;
            }
            const validAccessDb = await this.validateSessionDb()
            if (validAccessDb.code !== "success") {
                return validAccessDb;
            }
            // check loginName, userId and token validity... from accessKeys collection
            const validToken = await this.sessionModel.findOne({
                where: {
                    id       : this.userInfo.userId,
                    loginName: this.userInfo.loginName,
                    token    : this.userInfo.token,
                }
            });

            // validate login status
            if (validToken || !isEmptyObject(validToken)) {
                if (Date.now() > Number(validToken.expire)) {
                    return getResMessage("tokenExpired", {
                        message: "Access expired: please login to continue",
                    });
                }
            } else {
                return getResMessage("notFound", {
                    message: `Access information for ${this.userInfo.loginName} not found. Login first, or contact system administrator`,
                });
            }

            // check if user exists
            let validUser;
            const {email, username} = this.emailUsername(this.userInfo.loginName);
            if (email) {
                validUser = await this.userModel.findOne({
                    where: {
                        id      : this.userInfo.userId,
                        email   : email,
                        isActive: true,
                    }
                });
            } else {
                validUser = await this.userModel.findOne({
                    where: {
                        id      : this.userInfo.userId,
                        username: username,
                        isActive: true,
                    }
                });
            }

            if (!validUser || isEmptyObject(validUser)) {
                return getResMessage("notFound", {
                    message: `Record not found for ${this.userInfo.loginName}. Register a new account`,
                });
            }

            return getResMessage("success", {
                message: "Access Permitted: ",
                value  : {
                    userId  : validUser.id,
                    groupId : validUser.profile.groupId,
                    groupIds: validUser.groupIds,
                    isActive: validUser.isActive,
                    isAdmin : validUser.isAdmin || false,
                }
            });
        } catch (e) {
            console.error(e);
            return getResMessage("accessDenied", {
                message: "Unable to verify access information: " + e.message,
            });
        }
    }

}

export function newCrud(params: CrudParamsType, options?: CrudOptionsType) {
    return new Crud(params, options);
}
