IF EXISTS (
  SELECT 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'Season'
    AND COLUMN_NAME IN ('startedOn', 'endedOn')
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

    ALTER TABLE dbo.Season
      ADD startedOn_date DATE NULL,
          endedOn_date DATE NULL;

    UPDATE dbo.Season
    SET startedOn_date = CAST(startedOn AS DATE),
        endedOn_date = CAST(endedOn AS DATE);

    ALTER TABLE dbo.Season DROP COLUMN startedOn;
    ALTER TABLE dbo.Season DROP COLUMN endedOn;

    EXEC sp_rename 'dbo.Season.startedOn_date', 'startedOn', 'COLUMN';
    EXEC sp_rename 'dbo.Season.endedOn_date', 'endedOn', 'COLUMN';

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;

    THROW;
  END CATCH;
END;
