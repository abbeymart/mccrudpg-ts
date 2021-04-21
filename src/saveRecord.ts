/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-16
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mcaccess: saveRecord(s) - create/update
 */

import { Crud } from "./crud";
import { CrudOptionsType, CrudParamsType, MessageObject, ActionParamsType, ActionParamTaskType, } from "./types";
import { getParamsMessage, isEmptyObject, } from "./helper";
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { getHashCache, CacheResponseType, setHashCache, deleteHashCache } from "@mconnect/mccache";
import { Op } from "sequelize";

const sequelize = require("sequelize");

class SaveRecord extends Crud {
    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        super(params, options);
    }

    async saveRecord(): Promise<ResponseMessage> {
        // validate models
        const validDb = await this.validateCrudDb()
        if (validDb.code !== "success") {
            return validDb;
        }
        const validAccessDb = await this.validateAccessDb()
        if (validAccessDb.code !== "success") {
            return validAccessDb;
        }
        const validAuditDb = await this.validateAuditDb()
        if (validAuditDb.code !== "success") {
            return validAuditDb;
        }

        // determine update / create (new) items from actionParams
        await this.computeItems();

        // for queryParams, exclude id, if present
        if (this.queryParams && !isEmptyObject(this.queryParams)) {
            const {id, ...otherParams} = this.queryParams as any;
            this.queryParams = otherParams;
        }

        // create records/documents
        if (this.createRecords && this.createRecords.length > 0) {
            try {
                // create records
                return await this.createRecord();
            } catch (e) {
                console.error(e);
                return getResMessage("insertError", {
                    message: "Error-inserting/creating new record.",
                });
            }
        }

        // update existing records/documents
        if (this.updateRecords && this.updateRecords.length > 0) {
            try {
                // get current records update and audit log
                const currentRec = await this.getCurrentRecords();
                if (currentRec.code !== "success") {
                    return currentRec;
                }
                // update records
                return await this.updateRecordById();
            } catch (e) {
                console.error(e);
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        // update records/documents by queryParams: permitted by userId (own records), admin(all records) or role
        if (this.isAdmin && this.recordIds && this.recordIds.length < 1 && this.queryParams && !isEmptyObject(this.queryParams) && this.actionParams && this.actionParams.length === 1) {
            try {
                // get current records update and audit log
                const currentRec = await this.getCurrentRecordsByParams();
                if (currentRec.code !== "success") {
                    return currentRec;
                }
                // update records
                return await this.updateRecordByParams();
            } catch (e) {
                console.error(e);
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        // return save-error message
        return getResMessage("saveError", {
            message: "Error performing the requested operation(s). Please retry",
        });
    }

    // helper methods:
    async computeItems(): Promise<ActionParamTaskType> {
        let updateRecords: Array<ActionParamsType> = [],
            recordIds: Array<string> = [],
            createRecords: Array<ActionParamsType> = [];

        // Ensure the id for actionParams are of type mongoDb-new ObjectId, for update actions
        if (this.actionParams && this.actionParams.length > 0) {
            this.actionParams.forEach((item: any) => {
                if (item.id) {
                    // update/existing document
                    updateRecords.push(item);
                    recordIds.push(item.id);
                } else {
                    // exclude any traces of id with/without specified/concrete value ("", null, undefined), if present
                    const {id, ...saveParams} = item;
                    item = saveParams;
                    // create/new document
                    createRecords.push(item);
                }
            });
            this.createRecords = createRecords;
            this.updateRecords = updateRecords;
            this.recordIds = recordIds;
        }
        return {
            createRecords,
            updateRecords,
            recordIds,
        };
    }

    async createRecord(): Promise<ResponseMessage> {
        // insert/create multiple records and log in audit
        try {
            if (this.createRecords && this.createRecords.length) {
                // insert/create multiple records and log in audit
                const records = await this.crudModel.create(this.createRecords)
                if (records.insertedCount > 0) {
                    // delete cache
                    await deleteHashCache(this.crudTable, this.hashKey, "key");
                    // check the audit-log settings - to perform audit-log
                    if (this.logCreate) await this.transLog.createLog(this.crudTable, this.createRecords, this.userId);
                    return getResMessage("success", {
                        message: "Record(s) created successfully.",
                        value  : {
                            docCount: records.insertedCount,
                        },
                    });
                } else {
                    return getResMessage("insertError", {
                        message: "Unable to create new record(s), database error. ",
                    });
                }
            } else {
                return getResMessage("insertError", {
                    message: "Unable to create new record(s), due to incomplete/incorrect input-parameters. ",
                });
            }
        } catch (e) {
            return getResMessage("insertError", {
                message: `Error inserting/creating new record(s): ${e.message ? e.message : ""}`,
            });
        }
    }

    async updateRecordById(): Promise<ResponseMessage> {
        // updated records
        return new Promise(async (resolve) => {
            try {
                // check/validate update/upsert command for multiple records
                let updateCount = 0;

                // update one record
                if (this.updateRecords && this.updateRecords.length === 1) {
                    // destruct id /other attributes
                    const item: any = this.updateRecords[0];
                    const {
                        id,
                        ...otherParams
                    } = item;
                    const updateResult = await this.crudModel.update({
                        otherParams, where: {
                            id: id,
                        }
                    });
                    updateCount += Number(updateResult.modifiedCount);
                }

                // update multiple records | TODO: via transaction
                if (this.updateRecords && this.updateRecords.length > 1) {
                    for (let i = 0; i < this.updateRecords.length; i++) {
                        const item: any = this.updateRecords[i];
                        // destruct id /other attributes
                        const {
                            id,
                            ...otherParams
                        } = item;
                        const updateResult = await this.crudModel.update({
                            otherParams, where: {
                                id: id,
                            }
                        });
                        updateCount += Number(updateResult.modifiedCount);
                    }
                }

                if (updateCount > 0) {
                    // delete cache
                    await deleteHashCache(this.crudTable, this.hashKey, "key");
                    // check the audit-log settings - to perform audit-log
                    if (this.logUpdate) await this.transLog.updateLog(this.crudTable, this.currentRecords, this.updateRecords, this.userId);
                    resolve(getResMessage("success", {
                        message: "Record(s) updated successfully.",
                        value  : {
                            docCount: updateCount,
                        },
                    }));
                } else {
                    resolve(getResMessage("updateError", {
                        message: "No records updated. Please retry.",
                    }));
                }

            } catch (e) {
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                    value  : e,
                });
            }
        });
    }

    async updateRecordByParams(): Promise<ResponseMessage> {
        // updated records
        try {
            // check/validate update/upsert command for multiple records
            if (this.actionParams) {
                // update multiple records
                // destruct id /other attributes
                const item: any = this.actionParams[0];
                const {id, ...otherParams} = item;
                // include item stamps: userId and date
                otherParams.updatedBy = this.userId;
                const updateResult = await this.crudModel.update({
                    otherParams, where: {
                        ...this.queryParams,
                    }
                });
                if (Number(updateResult.modifiedCount) > 0) {
                    // delete cache
                    await deleteHashCache(this.crudTable, this.hashKey, "key");
                    // check the audit-log settings - to perform audit-log
                    if (this.logUpdate) await this.transLog.updateLog(this.crudTable, this.currentRecords, otherParams, this.userId);
                    return getResMessage("success", {
                        message: "Requested action(s) performed successfully.",
                        value  : {
                            docCount: updateResult.modifiedCount,
                        },
                    });
                } else {
                    return getResMessage("updateError", {
                        message: "No records updated. Please retry.",
                    });
                }
            } else {
                return getResMessage("updateError", {
                    message: `Error updating record(s): `,
                });
            }
        } catch (e) {
            return getResMessage("updateError", {
                message: `Error updating record(s): ${e.message ? e.message : ""}`,
                value  : e,
            });
        }
    }

}

// factory function/constructor
function newSaveRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new SaveRecord(params, options);
}

export { SaveRecord, newSaveRecord };
