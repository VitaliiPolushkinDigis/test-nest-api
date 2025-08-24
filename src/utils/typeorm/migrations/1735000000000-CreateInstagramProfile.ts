import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInstagramProfile1735000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'instagram_profiles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instagramBusinessAccountId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'facebookPageId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'facebookAccessToken',
            type: 'text',
          },
          {
            name: 'instagramAccessToken',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastSyncAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'userId',
            type: 'int',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'instagram_profiles',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('instagram_profiles');
  }
}
