/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-18
 * @Company: Copyright 2021 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mccrudpg: types
 */

import { Sequelize } from "sequelize";

// types
export enum TaskTypes {
    CREATE,
    INSERT,
    UPDATE,
    READ,
    DELETE,
    REMOVE,
}

export interface DbSecureType {
    secureAccess: boolean;
    secureCert?: string;
    secureKey?: string;
}

export type DbConnectType = Sequelize;

export type DbType = "postgres" | "sqlite" | "mysql" | "mariadb" | "mssql" | undefined;

export interface DbOptionType {
    host?: string;
    username?: string;
    password?: string;
    database?: string;
    filename?: string;
    location?: string;
    port?: number | string;
    dbType?: DbType;
    poolSize?: number;
    secureOption?: DbSecureType;
    uri?: string;
}

export interface DbConfigType {
    [key: string]: DbOptionType;
}

export interface DbConnectOptions {
    [key: string]: string | number | object | boolean;
}

export interface MongoDbOptions {
    checkAccess?: boolean;
    poolSize?: number;
    reconnectTries?: number;
    reconnectInterval?: number;
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
}

export interface DatabaseType {
    dbType: DbType;
    postgres: DbConfigType;
    mongodb: DbConfigType;
    redis: DbConfigType;
    mysql: DbConfigType;
    mariadb: DbConfigType;
    mssql: DbConfigType;
    sqlite: DbConfigType;
}

export interface RoleServiceType {
    serviceId: string;
    groupId: string;
    serviceCategory: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    tableAccessPermitted?: boolean;
}

export interface CheckAccessType {
    userId: string;
    groupId: string;
    groupIds: Array<string>;
    isActive: boolean;
    isAdmin: boolean;
    roleServices: Array<RoleServiceType>;
    tableId: string;
}

export interface OkResponse {
    ok: boolean;
}

export interface RoleFuncType {
    (it1: string, it2: RoleServiceType): boolean;
}

// Exception/error types
export type SaveError = Error;
export type CreateError = Error;
export type UpdateError = Error;
export type DeleteError = Error;
export type ReadError = Error;
export type AuthError = Error;
export type ConnectError = Error
export type SelectQueryError = Error
export type WhereQueryError = Error
export type CreateQueryError = Error
export type UpdateQueryError = Error
export type DeleteQueryError = Error

export interface MessageObject {
    [key: string]: string;
}

export interface ValidateResponseType {
    ok: boolean;
    errors?: MessageObject;
}

/// UserInfo: required for access management
export interface UserInfoType {
    userId: string;
    firstName: string;
    lastName: string;
    language: string;
    loginName: string;
    token: string;
    expire: number;
    group?: string;
    email?: string;
}

// types
export interface ActionParamsType {
    [key: string]: any;         // must match the model type
}

export interface QueryParamsType {
    [key: string]: any;
}

export interface ProjectParamsType {
    [key: string]: number | boolean; // 1 or true for inclusion, 0 or false for exclusion
}

export interface SortParamsType {
    [key: string]: "ASC" | "DESC";
}

export interface CrudParamsType {
    crudModel: any;
    crudTable: string;
    userInfo?: UserInfoType;
    actionParams?: Array<ActionParamsType>;
    queryParams?: QueryParamsType;
    recordIds?: Array<string>;
    projectParams?: ProjectParamsType;
    sortParams?: SortParamsType;
    token?: string;
    sessionModel?: any;
    auditModel?: any;
    serviceModel?: any;
    userModel?: any;
    profileModel?: any;
    verifyModel?: any;
    roleModel?: any;
    taskType?: string;
}

export interface CrudOptionsType {
    skip?: number;
    limit?: number;
    checkAccess?: boolean;
    maxQueryLimit?: number;
    logAll?: boolean;
    logCreate?: boolean;
    logUpdate?: boolean;
    logRead?: boolean;
    logDelete?: boolean;
    logLogin?: boolean;
    logLogout?: boolean;
    unAuthorizedMessage?: string;
    recExistMessage?: string;
    cacheExpire?: number;
    loginTimeout?: number;
    usernameExistsMessage?: string;
    emailExistsMessage?: string;
    msgFrom?: string;
}

export interface ActionParamTaskType {
    createRecords: Array<ActionParamsType>;
    updateRecords: Array<ActionParamsType>;
    recordIds: Array<string>;
}

export interface EmailUserNameType {
    email: string;
    username: string;
}
