import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateTransactions1599005238910 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.createTable(
        new Table({
          name: 'transactions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'title',
              type: 'varchar',
            },
            {
              name: 'value',
              type: 'decimal'
            },
            {
              name: 'type',
              type: 'varchar'
            },
            {
              name: 'category_id',
              type: 'uuid',
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
        ]
        })
      )

      await queryRunner.createForeignKey('transactions',
      new TableForeignKey({
        name: 'CategoriesFK',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.dropTable('transactions');
    }

}
