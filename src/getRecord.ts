/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-16
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mcaccess: getRecord(s)
 */
import { Crud, CrudOptionsType, CrudParamsType } from "../crud";
import { validateUserInfo } from "../../models";
import { getParamsMessage, } from "@mconnect/mcutils";
import { isEmptyObject, MessageObject } from "@mconnect/mcmail";
import { getResMessage } from "@mconnect/mcresponse";
import { getHashCache, CacheResponseType, setHashCache } from "@mconnect/mccache";
import { Op } from "sequelize";

class GetRecord extends Crud {
    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        super(params, options);
    }

    async getRecord() {
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
        // validate request params
        const validate = validateUserInfo(this.userInfo);
        if (!validate.ok) {
            return getParamsMessage(validate.errors as MessageObject);
        }

        // set maximum limit and default values per query
        if (this.limit < 1) {
            this.limit = 1;
        } else if (this.limit > this.maxQueryLimit) {
            this.limit = this.maxQueryLimit;
        }
        if (this.skip < 0) {
            this.skip = 0;
        }

        // check the audit-log settings - to perform audit-log (read/search info - params, keywords etc.)
        if (this.logRead && this.queryParams && !isEmptyObject(this.queryParams)) {
            await this.transLog.readLog(this.crudTable, this.queryParams, this.userId);
        } else if (this.logRead && this.recordIds && this.recordIds.length > 0) {
            await this.transLog.readLog(this.crudTable, this.recordIds, this.userId);
        }

        // check cache for matching record(s), and return if exist
        try {
            const items: CacheResponseType = await getHashCache(this.crudTable, this.hashKey);
            if (items && items.value && Array.isArray(items.value) && items.value.length > 0) {
                console.log("cache-items-before-query: ", items.value[0]);
                return getResMessage("success", {
                    value  : items.value,
                    message: "from cache",
                });
            }
        } catch (e) {
            console.error("error from the cache: ", e.stack);
        }

        // exclude id, if present, from the queryParams
        if (this.queryParams && !isEmptyObject(this.queryParams)) {
            const qParams: any = this.queryParams;
            const {id, ...otherParams} = qParams; // exclude id, if present
            this.queryParams = otherParams;
        }

        // Get the item(s) by docId(s), queryParams or all items
        let result = [];
        if (this.recordIds && this.recordIds.length > 0) {
            try {
                result = await this.crudModel.findAll({
                    where: {
                        id: {[Op.in]: this.recordIds},
                    },
                    skip : this.skip,
                    limit: this.limit,
                });
                if (result.length > 0) {
                    // save copy in the cache
                    await setHashCache(this.crudTable, this.hashKey, result, this.cacheExpire);
                    return getResMessage("success", {
                        value: result,
                    });
                }
                return getResMessage("notFound");
            } catch (error) {
                return getResMessage("notFound", {
                    value: error,
                });
            }
        }

        if (this.queryParams && Object.keys(this.queryParams).length > 0) {
            try {
                const result = await this.crudModel.findAll({
                    where: {
                        queryParams: this.queryParams,
                    },
                    skip : this.skip,
                    limit: this.limit,
                });
                if (result.length > 0) {
                    // save copy in the cache
                    await setHashCache(this.crudTable, this.hashKey, result, this.cacheExpire);
                    return getResMessage("success", {
                        value: result,
                    });
                }
                return getResMessage("notFound");
            } catch (error) {
                return getResMessage("notFound", {
                    value: error,
                });
            }
        }

        // get all records, up to the permissible limit
        try {
            const result = await this.crudModel.findAll({
                skip : this.skip,
                limit: this.limit,
            });
            if (result.length > 0) {
                // save copy in the cache
                await setHashCache(this.crudTable, this.hashKey, result, this.cacheExpire);
                return getResMessage("success", {
                    value: result,
                });
            }
            return getResMessage("notFound");
        } catch (error) {
            return getResMessage("notFound", {
                value: error,
            });
        }
    }
}

// factory function/constructor
function newGetRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new GetRecord(params, options);
}

export { GetRecord, newGetRecord };
