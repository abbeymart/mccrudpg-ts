/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-16
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mcaccess: deleteRecord(s)
 */

import { Crud } from "./crud";
import { CrudOptionsType, CrudParamsType, MessageObject, } from "./types";
import { getParamsMessage, isEmptyObject, } from "./helper";
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { getHashCache, CacheResponseType, setHashCache, deleteHashCache } from "@mconnect/mccache";
import { Op } from "sequelize";
import { validateDeleteParams } from "../../mc-crud-mg/src/ValidateCrudParam";
import { CrudTaskType } from "../../mc-crud-mg/src";

class DeleteRecord extends Crud {
    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        super(params, options);
        // Set specific instance properties
        // this.currentRecords = [];
    }

    async deleteRecord(): Promise<ResponseMessage> {
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

        // exclude id, if present, from the queryParams
        if (this.queryParams && !isEmptyObject(this.queryParams)) {
            const qParams: any = this.queryParams;
            const {id, ...otherParams} = qParams; // exclude id, if present
            this.queryParams = otherParams;
        }

        // delete the record(s) by recordIds(s) or queryParams
        let result = [];
        if (this.recordIds && this.recordIds.length > 0) {
            try {
                result = await this.crudModel.destroy({
                    where: {
                        id: {[Op.in]: this.recordIds},
                    },
                });
                if (result.length) {
                    // delete cache
                    await deleteHashCache(this.crudTable, this.hashKey);
                    // check the audit-log settings - to perform audit-log
                    if (this.logDelete) {
                        await this.transLog.deleteLog(this.crudTable, this.currentRecords, this.userId);
                    }
                    return getResMessage("success", {
                        message: "Item/record(s) deleted successfully",
                        value  : {
                            recordIds: Number(result.length),
                        }
                    });
                } else {
                    return getResMessage("removeError", {
                        message: "Error removing/deleting record(s): ",
                    });
                }
            } catch (e) {
                return getResMessage("removeError", {
                    message: `Error removing/deleting record(s): ${e.message ? e.message : ""}`,
                    value  : {},
                });
            }
        }

        if (this.queryParams && Object.keys(this.queryParams).length > 0) {
            try {
                const result = await this.crudModel.destroy({
                    where: {
                        queryParams: this.queryParams,
                    },
                });
                if (result.length) {
                    // delete cache
                    await deleteHashCache(this.crudTable, this.hashKey);
                    // check the audit-log settings - to perform audit-log
                    if (this.logDelete) {
                        await this.transLog.deleteLog(this.crudTable, this.currentRecords, this.userId);
                    }
                    return getResMessage("success", {
                        message: "Item/record(s) deleted successfully",
                        value  : {
                            recordIds: Number(result.length),
                        }
                    });
                } else {
                    return getResMessage("removeError", {
                        message: "Error removing/deleting record(s): ",
                    });
                }
            } catch (e) {
                return getResMessage("removeError", {
                    message: `Error removing/deleting record(s): ${e.message ? e.message : ""}`,
                    value  : {},
                });
            }
        }
        // could not remove document
        return getResMessage("removeError", {
            message: "Unable to perform the requested action(s), due to incomplete/incorrect delete conditions. ",
        });
    }
}

// factory function/constructor
function newDeleteRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new DeleteRecord(params, options);
}

export { DeleteRecord, newDeleteRecord };


