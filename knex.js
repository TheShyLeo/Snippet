'use strict';

const knex = require('knex')({
    client: "mysql",
    connection: {
        host: "47.114.77.224",
        port: 8307,
        user: "root",
        password: "Veily@2020",
        database: "pcbs",
    },
    pool: {
        min: 0,
        max: 4
    }
});

async function test(){
    let old_role = await knex.select().from('b_role_test').where('del_flag','0').where('subsystem_id','1');
    for (const v of res) {
        console.log('==================');
        console.log(v);
    }
    
}

test();

