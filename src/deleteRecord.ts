/**
 * @Author: abbeymart | Abi Akindele | @Created: 2021-04-16
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mcaccess: deleteRecord(s)
 */

import { Crud, CrudOptionsType, CrudParamsType } from "../crud";

export class DeleteRecord extends Crud {
    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        super(params, options);
    }

}
