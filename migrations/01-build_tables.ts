import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('intents', (table) => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.decimal('confidence').notNullable();
      table.uuid('session_id').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('intents');
}
