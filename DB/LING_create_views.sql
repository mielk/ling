USE [ling];

GO

begin transaction;

GO

CREATE VIEW [dbo].[View_WordProperties] AS 
SELECT 
	wp.[Id],
	w.[Name] AS [Word],
	gpd.[Name] AS [Property],
	gpo.[Name] AS [Option]
FROM 
	[dbo].[WordsProperties] wp
	LEFT JOIN [dbo].[Words] w ON wp.[WordId] = w.[Id]
	LEFT JOIN [dbo].[GrammarPropertyDefinitions] gpd ON wp.[PropertyId]	= gpd.[Id]
	LEFT JOIN [dbo].[GrammarPropertyOptions] gpo ON wp.[ValueId] = gpo.[Id]

GO

SELECT * FROM [dbo].[View_WordProperties];

GO

CREATE VIEW [dbo].[View_WordRequiredProperties] AS 
SELECT
	wrp.[Id],
	l.[Name] AS [Language],
	wt.[FullName] AS [WordType],
	gpd.[Name] AS [Property]
FROM
	[dbo].[WordRequiredProperties] wrp
	LEFT JOIN [dbo].[Languages] l ON wrp.[LanguageId] = l.[Id]
	LEFT JOIN [dbo].[WordTypes] wt ON wrp.[WordtypeId] = wt.[Id]
	LEFT JOIN [dbo].[GrammarPropertyDefinitions] gpd ON wrp.[PropertyId] = gpd.[Id];

go 

select * from [dbo].[View_WordRequiredProperties];

GO

CREATE VIEW [dbo].[View_GrammarFormsDefinitionsProperties] AS
SELECT 
	gfdp.[Id],
    gfd.[Displayed] AS [Definition],
	p.[Name] AS [Property],
    o.[Name] AS [Option]
FROM 
	[dbo].[GrammarFormsDefinitionsProperties] gfdp
	LEFT JOIN [dbo].[GrammarFormsDefinitions] gfd ON gfdp.[DefinitionId] = gfd.[Id]
	LEFT JOIN [dbo].[GrammarPropertyDefinitions] p ON gfdp.[PropertyId] = p.[Id]
	LEFT JOIN [dbo].[GrammarPropertyOptions] o ON gfdp.[ValueId] = o.[Id]

GO

SELECT * FROM [dbo].[View_GrammarFormsDefinitionsProperties];

GO

CREATE VIEW [dbo].[View_GrammarFormsInactiveRules] AS
SELECT 
	ir.[Id],
    gfd.[Displayed] AS [Definition],
	p.[Name] AS [Property],
    o.[Name] AS [Option]
FROM 
	[dbo].[GrammarFormsInactiveRules] ir
	LEFT JOIN [dbo].[GrammarFormsDefinitions] gfd ON ir.[DefinitionId] = gfd.[Id]
	LEFT JOIN [dbo].[GrammarPropertyDefinitions] p ON ir.[PropertyId] = p.[Id]
	LEFT JOIN [dbo].[GrammarPropertyOptions] o ON ir.[ValueId] = o.[Id]


GO

SELECT * FROM [dbo].[View_GrammarFormsInactiveRules];

GO

CREATE VIEW [View_GrammarForms] AS
SELECT 
	  gf.[Id]
    , w.[Name] AS [Word]
    , gfd.[Displayed] AS [Form]
    , gf.[Content]
FROM 
	[dbo].[GrammarForms] gf
	LEFT JOIN [dbo].[Words] w ON gf.[WordId] = w.[Id]
	LEFT JOIN [dbo].[GrammarFormsDefinitions] gfd ON gf.[FormId] = gfd.[Id]

GO

SELECT * FROM [dbo].[View_GrammarForms];

GO

COMMIT transaction;