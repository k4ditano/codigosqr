#!/bin/bash

cd "$(dirname "$0")/../backend"

cat > temp_add_column.js << 'EOL'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addEmailColumn() {
    try {
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'codigos' AND column_name = 'email'
        `);

        if (checkColumn.rows.length === 0) {
            await pool.query(`
                ALTER TABLE codigos 
                ADD COLUMN email VARCHAR(100)
            `);
            console.log('Columna email agregada exitosamente');
        } else {
            console.log('La columna email ya existe');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

addEmailColumn();
EOL

node temp_add_column.js
rm temp_add_column.js 