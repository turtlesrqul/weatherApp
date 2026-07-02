CREATE TABLE dbo.search_history (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_search_history PRIMARY KEY,
    city_name NVARCHAR(255) NOT NULL,
    searched_at DATETIME2(0) NOT NULL CONSTRAINT DF_search_history_searched_at DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_search_history_searched_at
ON dbo.search_history (searched_at DESC);
