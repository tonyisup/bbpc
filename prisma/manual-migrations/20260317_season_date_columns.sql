IF EXISTS (
  SELECT 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'Season'
    AND COLUMN_NAME = 'startedOn'
    AND DATA_TYPE <> 'date'
)
OR EXISTS (
  SELECT 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'Season'
    AND COLUMN_NAME = 'endedOn'
    AND DATA_TYPE <> 'date'
)
BEGIN
  BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.Season_backup_20260317', 'U') IS NULL
    BEGIN
      SELECT *
      INTO dbo.Season_backup_20260317
      FROM dbo.Season;
    END;

    IF EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME = 'Season'
        AND COLUMN_NAME = 'startedOn'
        AND DATA_TYPE <> 'date'
    )
    BEGIN
      ALTER TABLE dbo.Season ADD startedOn_date DATE NULL;

      UPDATE dbo.Season
      SET startedOn_date = CAST(startedOn AS DATE);

      ALTER TABLE dbo.Season DROP COLUMN startedOn;

      EXEC sp_rename 'dbo.Season.startedOn_date', 'startedOn', 'COLUMN';
    END;

    IF EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME = 'Season'
        AND COLUMN_NAME = 'endedOn'
        AND DATA_TYPE <> 'date'
    )
    BEGIN
      ALTER TABLE dbo.Season ADD endedOn_date DATE NULL;

      UPDATE dbo.Season
      SET endedOn_date = CAST(endedOn AS DATE);

      ALTER TABLE dbo.Season DROP COLUMN endedOn;

      EXEC sp_rename 'dbo.Season.endedOn_date', 'endedOn', 'COLUMN';
    END;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;

    THROW;
  END CATCH;
END;
