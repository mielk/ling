USE [ling];
--GO

-- Czyszczenie bazy --

-- Usuwanie tabel
IF OBJECT_ID('dbo.VariantLimits', 'U') IS NOT NULL DROP TABLE [dbo].[VariantLimits]
IF OBJECT_ID('dbo.VariantDependencies', 'U') IS NOT NULL DROP TABLE [dbo].[VariantDependencies]
IF OBJECT_ID('dbo.VariantConnections', 'U') IS NOT NULL DROP TABLE [dbo].[VariantConnections]
IF OBJECT_ID('dbo.VariantSetProperties', 'U') IS NOT NULL DROP TABLE [dbo].[VariantSetProperties]
IF OBJECT_ID('dbo.Variants', 'U') IS NOT NULL DROP TABLE [dbo].[Variants]
IF OBJECT_ID('dbo.VariantSets', 'U') IS NOT NULL DROP TABLE [dbo].[VariantSets]

IF OBJECT_ID('dbo.QuestionsOptions', 'U') IS NOT NULL DROP TABLE [dbo].[QuestionsOptions]
IF OBJECT_ID('dbo.MatchQuestionCategory', 'U') IS NOT NULL DROP TABLE [dbo].[MatchQuestionCategory]
IF OBJECT_ID('dbo.Questions', 'U') IS NOT NULL DROP TABLE [dbo].[Questions]
IF OBJECT_ID('dbo.VariantSetRequiredProperties', 'U') IS NOT NULL DROP TABLE [dbo].[VariantSetRequiredProperties]
IF OBJECT_ID('dbo.VariantDependenciesDefinitions', 'U') IS NOT NULL DROP TABLE [dbo].[VariantDependenciesDefinitions]

IF OBJECT_ID('dbo.GrammarForms', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarForms]
IF OBJECT_ID('dbo.WordsProperties', 'U') IS NOT NULL DROP TABLE [dbo].[WordsProperties]
IF OBJECT_ID('dbo.Words', 'U') IS NOT NULL DROP TABLE [dbo].[Words]
IF OBJECT_ID('dbo.MatchWordCategory', 'U') IS NOT NULL DROP TABLE [dbo].[MatchWordCategory]
IF OBJECT_ID('dbo.Metawords', 'U') IS NOT NULL DROP TABLE [dbo].[Metawords]

IF OBJECT_ID('dbo.WordRequiredProperties', 'U') IS NOT NULL DROP TABLE [dbo].[WordRequiredProperties]
IF OBJECT_ID('dbo.GrammarFormsInactiveRules', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsInactiveRules]
IF OBJECT_ID('dbo.GrammarFormsDefinitionsProperties', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsDefinitionsProperties]
IF OBJECT_ID('dbo.GrammarFormsDefinitions', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsDefinitions]
IF OBJECT_ID('dbo.GrammarFormsGroups', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsGroups]

IF OBJECT_ID('dbo.GrammarPropertyOptions', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarPropertyOptions]
IF OBJECT_ID('dbo.GrammarPropertyDefinitions', 'U') IS NOT NULL DROP TABLE [dbo].[GrammarPropertyDefinitions]
IF OBJECT_ID('dbo.ValueTypes', 'U') IS NOT NULL DROP TABLE [dbo].[ValueTypes]
IF OBJECT_ID('dbo.WordTypes', 'U') IS NOT NULL DROP TABLE [dbo].[WordTypes]

IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE [dbo].[Categories]
IF OBJECT_ID('dbo.UsersLanguages', 'U') IS NOT NULL DROP TABLE [dbo].[UsersLanguages]
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE [dbo].[Users]
IF OBJECT_ID('dbo.Languages', 'U') IS NOT NULL DROP TABLE [dbo].[Languages]
IF OBJECT_ID('dbo.Countries', 'U') IS NOT NULL DROP TABLE [dbo].[Countries]


-- Usuwanie funkcji
IF OBJECT_ID('dbo.checkGrammarDefinitionLanguage', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkGrammarDefinitionLanguage]
IF OBJECT_ID('dbo.checkQuestionForVariantSet', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkQuestionForVariantSet]
IF OBJECT_ID('dbo.checkSetForVariant', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkSetForVariant]
IF OBJECT_ID('dbo.checkGrammarDefinitionWordtype', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkGrammarDefinitionWordtype]
IF OBJECT_ID('dbo.checkGrammarOptionProperty', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkGrammarOptionProperty]
IF OBJECT_ID('dbo.checkWordLanguage', N'FN') IS NOT NULL DROP FUNCTION [dbo].[checkWordLanguage]


GO


-- TABELE SYSTEMOWE --

-- Kraje
CREATE TABLE [dbo].[Countries] (
      [Id]			INT            IDENTITY (1, 1) NOT NULL
    , [ShortName]	NVARCHAR (3)   NOT NULL UNIQUE
    , [Name]		NVARCHAR (100) NOT NULL UNIQUE
--    , [FlagTop]     INT            NULL
--	  , [FlagLeft]    INT            NULL
    , CONSTRAINT [PK_Countries] PRIMARY KEY CLUSTERED ([Id] ASC)
);
SET IDENTITY_INSERT [dbo].[Countries] ON
BEGIN TRANSACTION;
INSERT INTO [dbo].[Countries] ([Id], [ShortName], [Name])
	SELECT 1, N'POL', N'Polska'
COMMIT;
SET IDENTITY_INSERT [dbo].[Countries] OFF


GO


-- Języki
CREATE TABLE [dbo].[Languages] (
      [Id]				INT				IDENTITY (1, 1) NOT NULL
    , [Name]			NVARCHAR (255)	NOT NULL UNIQUE
    , [Flag]			NVARCHAR (MAX)	NULL
    , [IsActive]		BIT				DEFAULT ((1)) NOT NULL
    , [OriginalName]	NVARCHAR (255)	NULL
    , CONSTRAINT [PK_Languages] PRIMARY KEY CLUSTERED ([Id] ASC)
);

SET IDENTITY_INSERT [dbo].[Languages] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Languages] ([Id], [Name], [Flag], [IsActive], [OriginalName])
	SELECT 1, N'polski', N'pol', 1, N'Polski' UNION ALL
	SELECT 2, N'angielski', N'gbr', 1, N'English' UNION ALL
	SELECT 3, N'hiszpański', N'esp', 1, N'Español' UNION ALL
	SELECT 4, N'włoski', N'ita', 1, N'Italiano'
COMMIT;
SET IDENTITY_INSERT [dbo].[Languages] OFF


GO


-- Userzy
CREATE TABLE [dbo].[Users] (
      [Id]				 INT            IDENTITY (1, 1) NOT NULL
    , [Username]         NVARCHAR (50)  NOT NULL UNIQUE
    , [Password]         NVARCHAR (MAX) NOT NULL
	, [FirstName]        NVARCHAR (100) NULL
    , [LastName]         NVARCHAR (100) NULL
    , [CountryId]        INT            NULL
    , [DateOfBirth]      DATETIME       NULL
    , [RegistrationDate] DATETIME       DEFAULT (GETDATE()) NOT NULL
    , [Email]            NVARCHAR (50)  NOT NULL UNIQUE
    , [IsActive]         BIT            DEFAULT ((1)) NOT NULL
    , [MailVerified]     BIT            DEFAULT ((0)) NOT NULL
    , [VerificationCode] NVARCHAR (MAX) NULL
    , [VerificationDate] DATETIME       NULL
    , CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_Users_Country] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[Countries] ([Id])
);

SET IDENTITY_INSERT [dbo].[Users] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Users] ([Id], [Username], [Password], [FirstName], [LastName], [CountryId], [Email])
SELECT 1, N'Mielnik', N'haslo', N'Tomasz', N'Mielniczek', 1, N'mielk@o2.pl'
COMMIT;
SET IDENTITY_INSERT [dbo].[Users] OFF

GO


-- Języki userów
CREATE TABLE [dbo].[UsersLanguages] (
      [Id]         INT		IDENTITY (1, 1) NOT NULL
    , [UserId]     INT		NOT NULL
    , [LanguageId] INT		NOT NULL
    , CONSTRAINT [PK_UsersLanguages] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_UserLanguage] UNIQUE NONCLUSTERED ([UserId] ASC, [LanguageId] ASC)
    , CONSTRAINT [FK_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
);

SET IDENTITY_INSERT [dbo].[UsersLanguages] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[UsersLanguages] ([Id], [UserId], [LanguageId])
	SELECT 1, 1, 1 UNION ALL
	SELECT 2, 1, 2 UNION ALL
	SELECT 3, 1, 3
COMMIT;
SET IDENTITY_INSERT [dbo].[UsersLanguages] OFF
GO


-- Kategorie
CREATE TABLE [dbo].[Categories] (
      [Id]         INT            IDENTITY (1, 1) NOT NULL
    , [Name]       NVARCHAR (255) NOT NULL UNIQUE
    , [ParentId]   INT            NULL
    , [IsActive]   BIT            DEFAULT ((1)) NOT NULL
    , [CreatorId]  INT            DEFAULT ((1)) NOT NULL
    , [CreateDate] DATETIME       DEFAULT (GETDATE()) NOT NULL
    , [IsApproved] BIT            DEFAULT ((0)) NOT NULL
    , [Positive]   INT            DEFAULT ((0)) NOT NULL
    , [Negative]   INT            DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_ExistingCategoryCanBeParent] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Categories] ([Id])
    , CONSTRAINT [FK_CategoryUser] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
);

SET IDENTITY_INSERT [dbo].[Categories] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Categories] ([Id], [Name], [ParentId]) 
	SELECT 1, N'root', NULL UNION ALL
	SELECT 2, N'Geografia', 1 UNION ALL
	SELECT 3, N'Państwa', 2 UNION ALL
	SELECT 4, N'Państwa - Europa', 3 UNION ALL
	SELECT 5, N'Państwa - Ameryka Północna', 3 UNION ALL
	SELECT 6, N'Państwa - Ameryka Południowa', 3 UNION ALL
	SELECT 7, N'Państwa - Afryka', 3 UNION ALL
	SELECT 8, N'Państwa - Azja', 3 UNION ALL
	SELECT 9, N'Państwa - Oceania', 3 UNION ALL
	SELECT 10, N'Miasta', 2 UNION ALL
	SELECT 11, N'Akweny', 2 UNION ALL
	SELECT 12, N'Góry', 2 UNION ALL
	SELECT 13, N'Morza', 11 UNION ALL
	SELECT 14, N'Przyroda', 1 UNION ALL
	SELECT 15, N'Rośliny', 14 UNION ALL
	SELECT 16, N'Zwierzęta', 14 UNION ALL
	SELECT 17, N'Zwierzęta - Ptaki', 16 UNION ALL
	SELECT 18, N'Zwierzęta - Domowe', 16 UNION ALL
	SELECT 19, N'Zwierzęta - Gospodarcze', 16 UNION ALL
	SELECT 20, N'Zwierzęta - Ryby', 16 UNION ALL
	SELECT 21, N'Zwierzęta - Owady', 16 UNION ALL
	SELECT 22, N'Zwierzęta - Płazy i gady', 16 UNION ALL
	SELECT 23, N'Zwierzęta - Egzotyczne', 16 UNION ALL
	SELECT 24, N'Rośliny - Owoce', 15 UNION ALL
	SELECT 25, N'Rośliny - Warzywa', 15 UNION ALL
	SELECT 26, N'Rośliny - Drzewa', 15 UNION ALL
	SELECT 27, N'Osoby', 1 UNION ALL
	SELECT 28, N'Profesje', 27 UNION ALL
	SELECT 29, N'Narodowości', 27 UNION ALL
	SELECT 30, N'Rodzina', 27 UNION ALL
	SELECT 41, N'Kontynenty', 2 UNION ALL
	SELECT 42, N'Wyspy', 2 UNION ALL
	SELECT 43, N'Krainy', 2 UNION ALL
	SELECT 44, N'Krainy - Europa', 43 UNION ALL
	SELECT 45, N'Krainy - Ameryka', 43 UNION ALL
	SELECT 46, N'Krainy - Azja', 43 UNION ALL
	SELECT 47, N'Krainy - Afryka', 43 UNION ALL
	SELECT 48, N'Kolory', 1 UNION ALL
	SELECT 49, N'Czas', 1 UNION ALL
	SELECT 50, N'Dni tygodnia i miesiące', 49 UNION ALL
	SELECT 51, N'Jednostki czasu', 49 UNION ALL
	SELECT 52, N'Społeczeństwo', 1 UNION ALL
	SELECT 53, N'Środowisko', 1 UNION ALL
	SELECT 54, N'Komunikacja', 1 UNION ALL
	SELECT 55, N'Dom', 1 UNION ALL
	SELECT 56, N'Dom - kuchnia', 57 UNION ALL
	SELECT 57, N'Dom - łazienka', 57 UNION ALL
	SELECT 58, N'Dom - pokój', 57 UNION ALL
	SELECT 59, N'Komunikacja - Media', 54 UNION ALL
	SELECT 60, N'Komunikacja - Transport', 54 UNION ALL
	SELECT 61, N'Człowiek', 1 UNION ALL
	SELECT 62, N'Instytucje', 52 UNION ALL
	SELECT 63, N'Obiekty topograficzne', 54 UNION ALL
	SELECT 64, N'Budynki', 54 UNION ALL
	SELECT 65, N'Rozrywka', 1 UNION ALL
	SELECT 66, N'Sport', 66 UNION ALL
	SELECT 67, N'Sztuka', 66 UNION ALL
	SELECT 68, N'Zabawa', 66 UNION ALL
	SELECT 69, N'Rzeki', 11 UNION ALL
	SELECT 70, N'Jeziora', 11 UNION ALL
	SELECT 71, N'Jedzenie', 1 UNION ALL
	SELECT 72, N'Przedmioty', 1 UNION ALL
	SELECT 73, N'Przedmioty - warsztat', 72 UNION ALL
	SELECT 74, N'Przedmioty - szkoła', 72 UNION ALL
	SELECT 75, N'Człowiek - części ciała', 61 UNION ALL
	SELECT 76, N'Człowiek - uczucia', 61 UNION ALL
	SELECT 77, N'Komunikacja - Informacje', 54 UNION ALL
	SELECT 78, N'Nagrody', 65 UNION ALL
	SELECT 79, N'Prawo', 65 UNION ALL
	SELECT 80, N'Prawo - przestępstwa', 65
COMMIT;
SET IDENTITY_INSERT [dbo].[Categories] OFF

GO



-- WORDS DEFINITIONS

-- Word types
CREATE TABLE [dbo].[WordTypes] (
      [Id]				INT				NOT NULL
    , [Name]			NVARCHAR (255)	NOT NULL UNIQUE
    , [DisplayForWord]	BIT				NOT NULL
	, CONSTRAINT [PK_WordTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);

BEGIN TRANSACTION;
	INSERT INTO [dbo].[WordTypes] ([Id], [Name], [DisplayForWord]) 
	SELECT 1, N'N', 1 UNION ALL
	SELECT 2, N'V', 1 UNION ALL
	SELECT 3, N'A', 1 UNION ALL
	SELECT 4, N'O', 1 UNION ALL
	SELECT 5, N'P', 0
COMMIT;

GO


-- Typy definiowanych wartości (np. radio, multilist, itp.)
CREATE TABLE [dbo].[ValueTypes] (
      [Id]				INT				IDENTITY (1, 1) NOT NULL
    , [Type]			NVARCHAR(255)	NOT NULL
    , CONSTRAINT [PK_ValueTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
)

SET IDENTITY_INSERT [dbo].[ValueTypes] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[ValueTypes] ([Id], [Type]) 
	SELECT 1, N'boolean' UNION ALL
	SELECT 2, N'radio' UNION ALL
	SELECT 3, N'multilist'
COMMIT;
SET IDENTITY_INSERT [dbo].[ValueTypes] OFF

GO


-- Definicje właściwości gramatycznych (np. rodzaj, liczba, itd.)
CREATE TABLE [dbo].[GrammarPropertyDefinitions] (
      [Id]				INT				IDENTITY (1, 1) NOT NULL
    , [LanguageId]		INT				NOT NULL
    , [Name]			NVARCHAR (255)	NOT NULL
    , [Type]			INT				NOT NULL
    , [Default]			BIT				NOT NULL
    , CONSTRAINT [PK_GrammarPropertyDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_GrammarPropertyDefinitions_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_GrammarPropertyDefinitions_ValueTypes] FOREIGN KEY ([Type]) REFERENCES [dbo].[ValueTypes] ([Id])
    , CONSTRAINT [U_LanguageName] UNIQUE NONCLUSTERED ([LanguageId] ASC, [Name] ASC)
);

SET IDENTITY_INSERT [dbo].[GrammarPropertyDefinitions] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarPropertyDefinitions] ([Id], [LanguageId], [Name], [Type], [Default]) 
	SELECT 1, 1, N'Rodzaj', 2, 0 UNION ALL
	SELECT 2, 1, N'Liczba', 2, 0 UNION ALL
	SELECT 3, 1, N'Czy osobowy', 1, 0 UNION ALL
	SELECT 4, 2, N'Gender', 2, 0 UNION ALL
	SELECT 5, 2, N'Number', 2, 0 UNION ALL
	SELECT 6, 2, N'Is person', 1, 0 UNION ALL
	SELECT 7, 1, N'Czy miejsce', 1, 0 UNION ALL
	SELECT 8, 2, N'Is place', 1, 0 UNION ALL
	SELECT 9, 1, N'Przypadek', 2, 0
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarPropertyDefinitions] OFF

GO




-- Dostępne opcje dla właściwości gramatycznych.
CREATE TABLE [dbo].[GrammarPropertyOptions] (
      [Id]				INT            IDENTITY (1, 1) NOT NULL
    , [PropertyId]		INT            NOT NULL
    , [Name]			NVARCHAR (255) NOT NULL
    , [Value]			INT            NOT NULL
    , [Default]			BIT            DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_GrammarPropertyOptions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_GrammarPropertyOptions_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
	, CONSTRAINT [U_PropertyName] UNIQUE NONCLUSTERED ([PropertyId] ASC, [Name] ASC)
	, CONSTRAINT [U_PropertyValue] UNIQUE NONCLUSTERED ([PropertyId] ASC, [Value] ASC)
);

SET IDENTITY_INSERT [dbo].[GrammarPropertyOptions] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarPropertyOptions] ([Id], [PropertyId], [Name], [Value], [Default])
	SELECT 1, 1, N'męski', 1, 1 UNION ALL
	SELECT 2, 1, N'żeński', 2, 0 UNION ALL
	SELECT 3, 1, N'nijaki', 3, 0 UNION ALL
	SELECT 4, 2, N'pojedyncza', 1, 0 UNION ALL
	SELECT 5, 2, N'mnoga', 2, 0 UNION ALL
	SELECT 6, 2, N'obie liczby', 3, 1 UNION ALL
	SELECT 7, 4, N'masculinum', 1, 0 UNION ALL
	SELECT 8, 4, N'femininum', 2, 0 UNION ALL
	SELECT 9, 4, N'neuter', 3, 1 UNION ALL
	SELECT 10, 5, N'only singular', 1, 0 UNION ALL
	SELECT 11, 5, N'only plural', 2, 0 UNION ALL
	SELECT 12, 5, N'both', 3, 1 UNION ALL
	SELECT 13, 3, N'osobowy', 1, 0 UNION ALL
	SELECT 14, 3, N'nieosobowy', 0, 1 UNION ALL
	SELECT 15, 7, N'miejsce', 1, 0 UNION ALL
	SELECT 16, 7, N'nie-miejsce', 0, 1 UNION ALL
	SELECT 17, 6, N'person', 1, 0 UNION ALL
	SELECT 18, 6, N'non-person', 0, 1 UNION ALL
	SELECT 19, 8, N'place', 1, 0 UNION ALL
	SELECT 20, 8, N'non-place', 0, 1 UNION ALL
	SELECT 21, 9, N'Mianownik', 0, 1 UNION ALL
	SELECT 22, 9, N'Dopełniacz', 1, 0 UNION ALL
	SELECT 23, 9, N'Celownik', 2, 0 UNION ALL
	SELECT 24, 9, N'Biernik', 3, 0 UNION ALL
	SELECT 25, 9, N'Narzędnik', 4, 0 UNION ALL
	SELECT 26, 9, N'Miejscownik', 5, 0 UNION ALL
	SELECT 27, 9, N'Wołacz', 6, 0
	
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarPropertyOptions] OFF


GO

-- Funkcja zwracająca właściwość przypisany do danej opcji
CREATE FUNCTION [dbo].[checkGrammarOptionProperty] (@Option INT) 
RETURNS INT 
AS BEGIN
	DECLARE @Property INT

	SET @Property = (SELECT [gpo].[PropertyId] FROM [dbo].[GrammarPropertyOptions] AS [gpo] WHERE [gpo].[Id] = @Option)

	RETURN @Property

END

GO






-- Tabela definiująca podział definicji gramatycznych na grupy
CREATE TABLE [dbo].[GrammarFormsGroups] (
      [Id]				INT            IDENTITY (1, 1) NOT NULL
    , [LanguageId]		INT            NOT NULL
    , [WordtypeId]		INT            NOT NULL
    , [Name]			NVARCHAR (255) NOT NULL
    , [IsHeader]		BIT            NOT NULL
    , [Index]			INT            NOT NULL
    , CONSTRAINT [PK_GrammarFormsGroups] PRIMARY KEY CLUSTERED ([Id] ASC)
	, CONSTRAINT [U_GrammarFormsGroups_UniqueName] UNIQUE NONCLUSTERED ([WordtypeId] ASC, [LanguageId] ASC, [Name] ASC)
    , CONSTRAINT [FK_GrammarFormsGroups_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_GrammarFormsGroups_Wordtype] FOREIGN KEY ([WordtypeId]) REFERENCES [dbo].[WordTypes] ([Id])
);

SET IDENTITY_INSERT [dbo].[GrammarFormsGroups] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarFormsGroups] ([Id], [LanguageId], [WordtypeId], [Name], [IsHeader], [Index])
	SELECT 1, 1, 1, 'Header', 1, 0 UNION ALL
	SELECT 2, 1, 1, 'Liczba pojedyncza', 0, 1 UNION ALL
	SELECT 3, 1, 1, 'Liczba mnoga', 0, 2 UNION ALL
	SELECT 4, 2, 1, 'Header', 1, 0 UNION ALL
	SELECT 5, 2, 1, 'Forms', 0, 1
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarFormsGroups] OFF





-- Tabela definiująca wszystkie formy gramatyczne przy odmianie wyrazów, np. rzeczownik liczby pojedynczej
CREATE TABLE [dbo].[GrammarFormsDefinitions] (
      [Id]				INT            IDENTITY (1, 1) NOT NULL
    , [GroupId]			INT			   NOT NULL
	, [Displayed]		NVARCHAR (255) NOT NULL
    --, [InactiveRules]	VARCHAR (255)  NULL
    , [Index]			INT            NOT NULL
    , CONSTRAINT [PK_GrammarFormsDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_GrammarFormsDefinitions_Groups] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[GrammarFormsGroups] ([Id])
);

SET IDENTITY_INSERT [dbo].[GrammarFormsDefinitions] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarFormsDefinitions] ([Id], [GroupId], [Displayed], [Index])
	SELECT 1, 1, 'To jest ...', 0 UNION ALL
	SELECT 2, 1, 'Nie ma ...', 1 UNION ALL
	SELECT 3, 1, 'Przyglądam się ...', 2 UNION ALL
	SELECT 4, 1, 'Widzę ...', 3 UNION ALL
	SELECT 5, 1, 'Porozmawiaj z ...', 4 UNION ALL
	SELECT 6, 1, 'Porozmawiaj o ...', 5 UNION ALL
	SELECT 7, 1, '!...', 6 UNION ALL
	SELECT 8, 2, 'Mianownik pojedynczy', 0 UNION ALL
	SELECT 9, 2, 'Dopełniacz pojedynczy', 1 UNION ALL
	SELECT 10, 2, 'Celownik pojedynczy', 2 UNION ALL
	SELECT 11, 2, 'Biernik pojedynczy', 3 UNION ALL
	SELECT 12, 2, 'Narzędnik pojedynczy', 4 UNION ALL
	SELECT 13, 2, 'Miejscownik pojedynczy', 5 UNION ALL
	SELECT 14, 2, 'Wołacz pojedynczy', 6 UNION ALL
	SELECT 15, 3, 'Mianownik mnogi', 0 UNION ALL
	SELECT 16, 3, 'Dopełniacz mnogi', 1 UNION ALL
	SELECT 17, 3, 'Celownik mnogi', 2 UNION ALL
	SELECT 18, 3, 'Biernik mnogi', 3 UNION ALL
	SELECT 19, 3, 'Narzędnik mnogi', 4 UNION ALL
	SELECT 20, 3, 'Miejscownik mnogi', 5 UNION ALL
	SELECT 21, 3, 'Wołacz mnogi', 6 UNION ALL
	SELECT 22, 1, 'Jadę ...', 7 UNION ALL
	SELECT 23, 1, 'Jestem ...', 8 UNION ALL
	SELECT 24, 2, 'Do', 7 UNION ALL
	SELECT 25, 2, 'W', 8 UNION ALL
	SELECT 27, 4, 'article', 0 UNION ALL
	SELECT 28, 4, 'singular', 1 UNION ALL
	SELECT 29, 4, 'plural', 2 UNION ALL
	SELECT 30, 4, 'to ...', 3 UNION ALL
	SELECT 31, 4, 'in ...', 4 UNION ALL
	SELECT 32, 5, 'article', 0 UNION ALL
	SELECT 33, 5, 'singular', 1 UNION ALL
	SELECT 34, 5, 'plural', 2 UNION ALL
	SELECT 35, 5, 'to ...', 3 UNION ALL
	SELECT 36, 5, 'in ...', 4
COMMIT;

SET IDENTITY_INSERT [dbo].[GrammarFormsDefinitions] OFF


GO

-- Funkcja zwracająca wordtype przypisany do danej definicji gramatycznej
CREATE FUNCTION [dbo].[checkGrammarDefinitionWordtype] (@Definition INT) 
RETURNS INT 
AS BEGIN
	DECLARE @Wordtype INT

	SET @Wordtype = (
		SELECT 
			[gfg].[WordtypeId] 
		FROM 
			[dbo].[GrammarFormsDefinitions] AS [gfd] 
			LEFT JOIN [dbo].[GrammarFormsGroups] AS [gfg] ON [gfd].[GroupId] = [gfg].[Id]
		WHERE 
			[gfd].[Id] = @Definition
	)

	RETURN @Wordtype

END

GO

-- Funkcja sprawdzająca poprawność matchowania Language-GrammarPropertyDefinition
CREATE FUNCTION [dbo].[checkGrammarDefinitionLanguage] (@Id INT) 
RETURNS INT 
AS BEGIN

	DECLARE @Language INT

	SET @Language = (SELECT [gdp].[LanguageId] FROM [dbo].[GrammarPropertyDefinitions] AS [gdp] WHERE [gdp].[Id] = @Id)

	RETURN @Language

END

GO





-- Tabela maczująca definicje form gramatycznych (z tabeli GrammarFormDefinitions) z odpowiednimi opcjami z tabeli GrammarPropertyOptions,
-- np. Rzeczownik liczby pojedynczej będzie zmaczowane z opcją Przypadek - rzeczownik oraz z opcją Liczba - pojedyncza
CREATE TABLE [dbo].[GrammarFormsDefinitionsProperties]
(
      [Id]				INT		IDENTITY (1, 1) NOT NULL
	, [DefinitionId]	INT		NOT NULL
	, [PropertyId]		INT		NOT NULL
	, [ValueId]			INT		NOT NULL
    , CONSTRAINT [PK_GrammarFormsDefinitionsProperties] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_GrammarFormsDefinitionsProperties_Definition] FOREIGN KEY ([DefinitionId]) REFERENCES [dbo].[GrammarFormsDefinitions] ([Id])
	, CONSTRAINT [FK_GrammarFormsDefinitionsProperties_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
	, CONSTRAINT [FK_GrammarFormsDefinitionsProperties_Value] FOREIGN KEY ([ValueId]) REFERENCES [dbo].[GrammarPropertyOptions] ([Id])
	, CONSTRAINT [CH_GrammarFormsDefinitionsProperties_MatchedValueProperty] CHECK ([dbo].[checkGrammarOptionProperty]([ValueId]) = [PropertyId])
	, CONSTRAINT [U_GrammarFormsDefinitionsProperties_UniquePropertyDefinition] UNIQUE NONCLUSTERED ([DefinitionId] ASC, [PropertyId] ASC)
);

SET IDENTITY_INSERT [dbo].[GrammarFormsDefinitionsProperties] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarFormsDefinitionsProperties] ([Id], [DefinitionId], [PropertyId], [ValueId]) 
	SELECT 1, 1, 2, 6 UNION ALL
	SELECT 2, 1, 9, 21 UNION ALL
	SELECT 3, 2, 2, 6 UNION ALL
	SELECT 4, 2, 9, 22 UNION ALL
	SELECT 5, 3, 2, 6 UNION ALL
	SELECT 6, 3, 9, 23 UNION ALL
	SELECT 7, 4, 2, 6 UNION ALL
	SELECT 8, 4, 9, 24 UNION ALL
	SELECT 9, 5, 2, 6 UNION ALL
	SELECT 10, 5, 9, 25 UNION ALL
	SELECT 11, 6, 2, 6 UNION ALL
	SELECT 12, 6, 9, 26 UNION ALL
	SELECT 13, 7, 2, 6 UNION ALL
	SELECT 14, 7, 9, 27 UNION ALL
	SELECT 15, 8, 2, 4 UNION ALL
	SELECT 16, 8, 9, 21 UNION ALL
	SELECT 17, 9, 2, 4 UNION ALL
	SELECT 18, 9, 9, 22 UNION ALL
	SELECT 19, 10, 2, 4 UNION ALL
	SELECT 20, 10, 9, 23 UNION ALL
	SELECT 21, 11, 2, 4 UNION ALL
	SELECT 22, 11, 9, 24 UNION ALL
	SELECT 23, 12, 2, 4 UNION ALL
	SELECT 24, 12, 9, 25 UNION ALL
	SELECT 25, 13, 2, 4 UNION ALL
	SELECT 26, 13, 9, 26 UNION ALL
	SELECT 27, 14, 2, 4 UNION ALL
	SELECT 28, 14, 9, 27 UNION ALL
	SELECT 29, 15, 2, 5 UNION ALL
	SELECT 30, 15, 9, 21 UNION ALL
	SELECT 31, 16, 2, 5 UNION ALL
	SELECT 32, 16, 9, 22 UNION ALL
	SELECT 33, 17, 2, 5 UNION ALL
	SELECT 34, 17, 9, 23 UNION ALL
	SELECT 35, 18, 2, 5 UNION ALL
	SELECT 36, 18, 9, 24 UNION ALL
	SELECT 37, 19, 2, 5 UNION ALL
	SELECT 38, 19, 9, 25 UNION ALL
	SELECT 39, 20, 2, 5 UNION ALL
	SELECT 40, 20, 9, 26 UNION ALL
	SELECT 41, 21, 2, 5 UNION ALL
	SELECT 42, 21, 9, 27 UNION ALL
	SELECT 43, 22, 7, 15 UNION ALL
	SELECT 44, 23, 7, 15 UNION ALL
	SELECT 45, 24, 7, 15 UNION ALL
	SELECT 46, 25, 7, 15 UNION ALL
	SELECT 47, 27, 5, 10 UNION ALL
	SELECT 48, 28, 5, 11 UNION ALL
	SELECT 49, 29, 8, 19 UNION ALL
	SELECT 50, 30, 8, 19 UNION ALL
	SELECT 51, 32, 5, 10 UNION ALL
	SELECT 52, 33, 5, 11 UNION ALL
	SELECT 53, 34, 8, 19 UNION ALL
	SELECT 54, 35, 8, 19
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarFormsDefinitionsProperties] OFF


GO


-- Tabela przechowująca warunki jakie muszą być spełnione, żeby dany rekord z [GrammarFormsDefinitions]
-- był nieaktywny, np. Rzeczownik pojedynczy będzie nieaktywny, jeżeli pole Liczba będzie ustawione na
-- Tylko mnoga.
CREATE TABLE [dbo].[GrammarFormsInactiveRules](
	  [Id]					INT		IDENTITY (1, 1) NOT NULL
	, [DefinitionId]		INT		NOT NULL
	, [PropertyId]			INT		NOT NULL
	, [ValueId]				INT		NOT NULL
	, CONSTRAINT [PK_GrammarFormsInactiveRules] PRIMARY KEY CLUSTERED ([Id] ASC)
	, CONSTRAINT [FK_GrammarFormsInactiveRules_Definition] FOREIGN KEY ([DefinitionId]) REFERENCES [dbo].[GrammarFormsDefinitions] ([Id])
	, CONSTRAINT [FK_GrammarFormsInactiveRules_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
	, CONSTRAINT [FK_GrammarFormsInactiveRules_Value] FOREIGN KEY ([ValueId]) REFERENCES [dbo].[GrammarPropertyOptions] ([Id])
	, CONSTRAINT [CH_GrammarFormsInactiveRules_MatchedValueProperty] CHECK ([dbo].[checkGrammarOptionProperty]([ValueId]) = [PropertyId])
	, CONSTRAINT [U_GrammarFormsInactiveRules_UniqueDefinitionPropertyValue] UNIQUE NONCLUSTERED ([DefinitionId] ASC, [PropertyId] ASC, [ValueId] ASC)
);

SET IDENTITY_INSERT [dbo].[GrammarFormsInactiveRules] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarFormsInactiveRules] ([Id], [DefinitionId], [PropertyId], [ValueId]) 
	SELECT 1, 8, 2, 5 UNION ALL
	SELECT 2, 9, 2, 5 UNION ALL
	SELECT 3, 10, 2, 5 UNION ALL
	SELECT 4, 11, 2, 5 UNION ALL
	SELECT 5, 12, 2, 5 UNION ALL
	SELECT 6, 13, 2, 5 UNION ALL
	SELECT 7, 14, 2, 5 UNION ALL
	SELECT 8, 15, 2, 4 UNION ALL
	SELECT 9, 16, 2, 4 UNION ALL
	SELECT 10, 17, 2, 4 UNION ALL
	SELECT 11, 18, 2, 4 UNION ALL
	SELECT 12, 19, 2, 4 UNION ALL
	SELECT 13, 20, 2, 4 UNION ALL
	SELECT 14, 21, 2, 4 UNION ALL
	SELECT 15, 22, 7, 16 UNION ALL
	SELECT 16, 23, 7, 16 UNION ALL
	SELECT 17, 24, 7, 16 UNION ALL
	SELECT 18, 25, 7, 16 UNION ALL
	SELECT 19, 32, 5, 11 UNION ALL
	SELECT 20, 33, 5, 11 UNION ALL
	SELECT 21, 34, 5, 10 UNION ALL
	SELECT 22, 30, 8, 20 UNION ALL
	SELECT 23, 31, 8, 20 UNION ALL
	SELECT 24, 35, 8, 20 UNION ALL
	SELECT 25, 36, 8, 20
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarFormsInactiveRules] OFF


GO


-- Właściwości wymagane dla danego typu wyrazów (np. określa, że rzeczowniki mają mieć zdefiniowany rodzaj i dostępne liczby).
CREATE TABLE [dbo].[WordRequiredProperties] (
      [Id]				INT				IDENTITY (1, 1) NOT NULL
    , [LanguageId]		INT				NOT NULL
    , [WordtypeId]		INT             NOT NULL
    , [PropertyId]		INT				NOT NULL
    , CONSTRAINT [PK_WordRequiredProperties] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_WordtypeRequired_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_WordtypeRequired_Wordtype] FOREIGN KEY ([WordtypeId]) REFERENCES [dbo].[WordTypes] ([Id])
    , CONSTRAINT [FK_WordtypeRequired_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
    , CONSTRAINT [U_WordtypeRequired_LanguageWordtypeProperty] UNIQUE NONCLUSTERED ([LanguageId] ASC, [WordtypeId] ASC, [PropertyId] ASC)
    , CONSTRAINT [CH_WordtypeRequired_LanguageMatched] CHECK ([LanguageId] = [dbo].[checkGrammarDefinitionLanguage]([PropertyId]))
);
SET IDENTITY_INSERT [dbo].[WordRequiredProperties] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[WordRequiredProperties] ([Id], [LanguageId], [WordtypeId], [PropertyId])
	SELECT 1, 1, 1, 1 UNION ALL
	SELECT 2, 1, 1, 2 UNION ALL
	SELECT 3, 1, 1, 3 UNION ALL
	SELECT 4, 1, 1, 7 UNION ALL
	SELECT 5, 2, 1, 4 UNION ALL
	SELECT 6, 2, 1, 5 UNION ALL
	SELECT 7, 2, 1, 6 UNION ALL
	SELECT 8, 2, 1, 8
COMMIT;
SET IDENTITY_INSERT [dbo].[WordRequiredProperties] OFF

GO


-- WORDS

-- Metawyrazy
CREATE TABLE [dbo].[Metawords] (
      [Id]         INT            IDENTITY (1, 1) NOT NULL
    , [Name]       NVARCHAR (255) NOT NULL UNIQUE
    , [Type]       INT            NOT NULL
    , [Weight]     INT            DEFAULT ((1)) NOT NULL
    , [IsActive]   BIT            DEFAULT ((1)) NOT NULL
    , [CreatorId]  INT            DEFAULT ((1)) NOT NULL
    , [CreateDate] DATETIME       DEFAULT (GETDATE()) NOT NULL
    , [IsApproved] BIT            DEFAULT ((0)) NOT NULL
    , [Positive]   INT            DEFAULT ((0)) NOT NULL
    , [Negative]   INT            DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_Metawords] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_WordType] FOREIGN KEY ([Type]) REFERENCES [dbo].[WordTypes] ([Id])
    , CONSTRAINT [FK_MetawordUser] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [CH_Weight] CHECK ([Weight] > (0) AND [Weight] <= (10))
);

SET IDENTITY_INSERT [dbo].[Metawords] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Metawords] ([Id], [Name], [Type], [Weight])
	SELECT 1, N'Polska', 1, 10 UNION ALL
	SELECT 2, N'pies', 1, 10 UNION ALL
	SELECT 4, N'Włochy', 1, 10 UNION ALL
	SELECT 5, N'Hiszpania', 1, 10 UNION ALL
	SELECT 6, N'Francja', 1, 10 UNION ALL
	SELECT 9, N'Niemcy', 1, 10 UNION ALL
	SELECT 10, N'Anglia', 1, 10 UNION ALL
	SELECT 11, N'Rosja', 1, 10 UNION ALL
	SELECT 12, N'Albania', 1, 6 UNION ALL
	SELECT 13, N'Andora', 1, 2 UNION ALL
	SELECT 14, N'Armenia', 1, 5 UNION ALL
	SELECT 15, N'Austria', 1, 8 UNION ALL
	SELECT 16, N'Azerbejdżan', 1, 5 UNION ALL
	SELECT 17, N'Białoruś', 1, 5 UNION ALL
	SELECT 18, N'Belgia', 1, 8 UNION ALL
	SELECT 19, N'Bośnia i Hercegowina', 1, 5 UNION ALL
	SELECT 20, N'Bułgaria', 1, 7 UNION ALL
	SELECT 21, N'Chorwacja', 1, 7 UNION ALL
	SELECT 22, N'Cypr', 1, 6 UNION ALL
	SELECT 23, N'Czechy', 1, 9 UNION ALL
	SELECT 24, N'Dania', 1, 9 UNION ALL
	SELECT 25, N'Estonia', 1, 6 UNION ALL
	SELECT 26, N'Finlandia', 1, 8 UNION ALL
	SELECT 27, N'Gruzja', 1, 5 UNION ALL
	SELECT 28, N'Grecja', 1, 9 UNION ALL
	SELECT 29, N'Węgry', 1, 8 UNION ALL
	SELECT 30, N'Islandia', 1, 6 UNION ALL
	SELECT 31, N'Irlandia', 1, 7 UNION ALL
	SELECT 32, N'Kazachstan', 1, 5 UNION ALL
	SELECT 33, N'Łotwa', 1, 5 UNION ALL
	SELECT 34, N'Liechtenstein', 1, 2 UNION ALL
	SELECT 35, N'Litwa', 1, 6 UNION ALL
	SELECT 36, N'Luksemburg', 1, 6 UNION ALL
	SELECT 37, N'Macedonia', 1, 5 UNION ALL
	SELECT 38, N'Malta', 1, 6 UNION ALL
	SELECT 39, N'Mołdawia', 1, 4 UNION ALL
	SELECT 40, N'Monako', 1, 3 UNION ALL
	SELECT 41, N'Czarnogóra', 1, 6 UNION ALL
	SELECT 42, N'Holandia', 1, 10 UNION ALL
	SELECT 43, N'Norwegia', 1, 9 UNION ALL
	SELECT 44, N'Portugalia', 1, 9 UNION ALL
	SELECT 45, N'Rumunia', 1, 8 UNION ALL
	SELECT 46, N'San Marino', 1, 2 UNION ALL
	SELECT 47, N'Serbia', 1, 7 UNION ALL
	SELECT 48, N'Słowacja', 1, 7 UNION ALL
	SELECT 49, N'Słowenia', 1, 6 UNION ALL
	SELECT 50, N'Szwecja', 1, 9 UNION ALL
	SELECT 51, N'Szwajcaria', 1, 10 UNION ALL
	SELECT 52, N'Turcja', 1, 9 UNION ALL
	SELECT 53, N'Ukraina', 1, 9 UNION ALL
	SELECT 54, N'Wielka Brytania', 1, 9 UNION ALL
	SELECT 55, N'Watykan', 1, 2 UNION ALL
	SELECT 56, N'Szkocja', 1, 6 UNION ALL
	SELECT 57, N'Brazylia', 1, 10 UNION ALL
	SELECT 58, N'Argentyna', 1, 9 UNION ALL
	SELECT 63, N'Peru', 1, 6 UNION ALL
	SELECT 64, N'Boliwia', 1, 5 UNION ALL
	SELECT 65, N'Chile', 1, 6 UNION ALL
	SELECT 66, N'Kolumbia', 1, 8 UNION ALL
	SELECT 67, N'Wenezuela', 1, 7 UNION ALL
	SELECT 68, N'Urugwaj', 1, 6 UNION ALL
	SELECT 70, N'Paragwaj', 1, 6 UNION ALL
	SELECT 80, N'Ekwador', 1, 6 UNION ALL
	SELECT 85, N'Chiny', 1, 10 UNION ALL
	SELECT 86, N'Japonia', 1, 10 UNION ALL
	SELECT 89, N'Indie', 1, 10 UNION ALL
	SELECT 93, N'Tajlandia', 1, 9 UNION ALL
	SELECT 94, N'Izrael', 1, 8 UNION ALL
	SELECT 95, N'Liban', 1, 6 UNION ALL
	SELECT 96, N'Jordania', 1, 5 UNION ALL
	SELECT 97, N'Syria', 1, 6 UNION ALL
	SELECT 98, N'Arabia Saudyjska', 1, 8 UNION ALL
	SELECT 99, N'Jemen', 1, 5 UNION ALL
	SELECT 100, N'Oman', 1, 5 UNION ALL
	SELECT 101, N'Zjednoczone Emiraty Arabskie', 1, 8 UNION ALL
	SELECT 102, N'Kuwejt', 1, 8 UNION ALL
	SELECT 103, N'Bahrajn', 1, 5 UNION ALL
	SELECT 104, N'Katar', 1, 7 UNION ALL
	SELECT 105, N'Irak', 1, 9 UNION ALL
	SELECT 106, N'Iran', 1, 9 UNION ALL
	SELECT 107, N'Afganistan', 1, 8 UNION ALL
	SELECT 109, N'Pakistan', 1, 8 UNION ALL
	SELECT 110, N'Uzbekistan', 1, 6 UNION ALL
	SELECT 111, N'Turkmenistan', 1, 3 UNION ALL
	SELECT 112, N'Tadżykistan', 1, 2 UNION ALL
	SELECT 113, N'Kirgistan', 1, 2 UNION ALL
	SELECT 114, N'Nepal', 1, 5 UNION ALL
	SELECT 115, N'Bhutan', 1, 2 UNION ALL
	SELECT 116, N'Bangladesz', 1, 4 UNION ALL
	SELECT 117, N'Sri Lanka', 1, 4 UNION ALL
	SELECT 118, N'Mongolia', 1, 5 UNION ALL
	SELECT 119, N'Laos', 1, 3 UNION ALL
	SELECT 120, N'Kambodża', 1, 4 UNION ALL
	SELECT 121, N'Wietnam', 1, 6 UNION ALL
	SELECT 122, N'Myanmar', 1, 2 UNION ALL
	SELECT 123, N'Korea Południowa', 1, 10 UNION ALL
	SELECT 124, N'Korea Północna', 1, 9 UNION ALL
	SELECT 125, N'Malezja', 1, 7 UNION ALL
	SELECT 126, N'Indonezja', 1, 7 UNION ALL
	SELECT 128, N'Filipiny', 1, 7 UNION ALL
	SELECT 129, N'Tajwan', 1, 8 UNION ALL
	SELECT 130, N'Hongkong', 1, 8 UNION ALL
	SELECT 131, N'Singapur', 1, 7 UNION ALL
	SELECT 132, N'Australia', 1, 10 UNION ALL
	SELECT 133, N'Nowa Zelandia', 1, 10 UNION ALL
	SELECT 134, N'Fidżi', 1, 6 UNION ALL
	SELECT 135, N'Egipt', 1, 10 UNION ALL
	SELECT 136, N'Libia', 1, 8 UNION ALL
	SELECT 137, N'Tunezja', 1, 9 UNION ALL
	SELECT 138, N'Maroko', 1, 10 UNION ALL
	SELECT 139, N'Algieria', 1, 8 UNION ALL
	SELECT 140, N'Sudan', 1, 7 UNION ALL
	SELECT 141, N'Etiopia', 1, 8 UNION ALL
	SELECT 142, N'Erytrea', 1, 2 UNION ALL
	SELECT 143, N'Dżibuti', 1, 2 UNION ALL
	SELECT 144, N'Czad', 1, 2 UNION ALL
	SELECT 145, N'Mauretania', 1, 2 UNION ALL
	SELECT 146, N'Burkina Faso', 1, 3 UNION ALL
	SELECT 147, N'Mali', 1, 4 UNION ALL
	SELECT 148, N'Senegal', 1, 8 UNION ALL
	SELECT 149, N'Gambia', 1, 2 UNION ALL
	SELECT 150, N'Gwinea', 1, 3 UNION ALL
	SELECT 151, N'Ghana', 1, 5 UNION ALL
	SELECT 152, N'Somalia', 1, 7 UNION ALL
	SELECT 153, N'Wybrzeże Kości Słoniowej', 1, 6 UNION ALL
	SELECT 154, N'Togo', 1, 3 UNION ALL
	SELECT 155, N'Liberia', 1, 4 UNION ALL
	SELECT 156, N'Sierra Leone', 1, 3 UNION ALL
	SELECT 157, N'Niger', 1, 3 UNION ALL
	SELECT 158, N'Nigeria', 1, 9 UNION ALL
	SELECT 159, N'Kamerun', 1, 8 UNION ALL
	SELECT 160, N'Gabon', 1, 7 UNION ALL
	SELECT 162, N'Kongo', 1, 8 UNION ALL
	SELECT 163, N'Demokratyczna Republika Konga', 1, 3 UNION ALL
	SELECT 164, N'Uganda', 1, 4 UNION ALL
	SELECT 165, N'Burundi', 1, 1 UNION ALL
	SELECT 166, N'Kenia', 1, 8 UNION ALL
	SELECT 167, N'Tanzania', 1, 6 UNION ALL
	SELECT 168, N'Mozambik', 1, 5 UNION ALL
	SELECT 169, N'Ruanda', 1, 3 UNION ALL
	SELECT 170, N'Madagaskar', 1, 7 UNION ALL
	SELECT 171, N'Angola', 1, 5 UNION ALL
	SELECT 172, N'Namibia', 1, 3 UNION ALL
	SELECT 174, N'RPA', 1, 9 UNION ALL
	SELECT 175, N'Zambia', 1, 7 UNION ALL
	SELECT 176, N'Zimbabwe', 1, 7 UNION ALL
	SELECT 177, N'Botswana', 1, 2 UNION ALL
	SELECT 178, N'Seszele', 1, 7 UNION ALL
	SELECT 180, N'Mauritius', 1, 8 UNION ALL
	SELECT 181, N'USA', 1, 10 UNION ALL
	SELECT 182, N'Kanada', 1, 10 UNION ALL
	SELECT 183, N'Meksyk', 1, 10 UNION ALL
	SELECT 184, N'Grenlandia', 1, 8 UNION ALL
	SELECT 185, N'Jamajka', 1, 9 UNION ALL
	SELECT 186, N'Kuba', 1, 10 UNION ALL
	SELECT 187, N'Honduras', 1, 6 UNION ALL
	SELECT 188, N'Salwador', 1, 6 UNION ALL
	SELECT 189, N'Gwatemala', 1, 6 UNION ALL
	SELECT 190, N'Nikaragua', 1, 6 UNION ALL
	SELECT 191, N'Panama', 1, 7 UNION ALL
	SELECT 193, N'Dominikana', 1, 8 UNION ALL
	SELECT 194, N'Haiti', 1, 7 UNION ALL
	SELECT 195, N'Portoryko', 1, 7 UNION ALL
	SELECT 196, N'Kostaryka', 1, 7 UNION ALL
	SELECT 197, N'Belize', 1, 3 UNION ALL
	SELECT 198, N'Bahamy', 1, 5 UNION ALL
	SELECT 199, N'Europa', 1, 10 UNION ALL
	SELECT 200, N'Ameryka Południowa', 1, 10 UNION ALL
	SELECT 201, N'Ameryka Północna', 1, 10 UNION ALL
	SELECT 202, N'Afryka', 1, 10 UNION ALL
	SELECT 203, N'Azja', 1, 10 UNION ALL
	SELECT 204, N'Oceania', 1, 10 UNION ALL
	SELECT 205, N'Skandynawia', 1, 9 UNION ALL
	SELECT 206, N'Kaukaz', 1, 9 UNION ALL
	SELECT 207, N'Karaiby', 1, 9 UNION ALL
	SELECT 208, N'kot', 1, 10 UNION ALL
	SELECT 209, N'chomik', 1, 8 UNION ALL
	SELECT 210, N'krowa', 1, 9 UNION ALL
	SELECT 211, N'koń', 1, 10 UNION ALL
	SELECT 212, N'mucha', 1, 9 UNION ALL
	SELECT 213, N'pszczoła', 1, 9 UNION ALL
	SELECT 214, N'osa', 1, 7 UNION ALL
	SELECT 215, N'komar', 1, 8 UNION ALL
	SELECT 216, N'żaba', 1, 8 UNION ALL
	SELECT 217, N'ptak', 1, 10 UNION ALL
	SELECT 218, N'ryba', 1, 10 UNION ALL
	SELECT 219, N'bocian', 1, 7 UNION ALL
	SELECT 220, N'wróbel', 1, 6 UNION ALL
	SELECT 221, N'motyl', 1, 10 UNION ALL
	SELECT 222, N'małpa', 1, 10 UNION ALL
	SELECT 223, N'słoń', 1, 10 UNION ALL
	SELECT 224, N'lew', 1, 10 UNION ALL
	SELECT 225, N'żyrafa', 1, 10 UNION ALL
	SELECT 226, N'wielbłąd', 1, 10 UNION ALL
	SELECT 227, N'tygrys', 1, 10 UNION ALL
	SELECT 228, N'wąż', 1, 10 UNION ALL
	SELECT 229, N'rekin', 1, 9 UNION ALL
	SELECT 230, N'wieloryb', 1, 7 UNION ALL
	SELECT 231, N'osioł', 1, 8 UNION ALL
	SELECT 232, N'owca', 1, 9 UNION ALL
	SELECT 233, N'gołąb', 1, 7 UNION ALL
	SELECT 234, N'sokół', 1, 8 UNION ALL
	SELECT 235, N'orzeł', 1, 10 UNION ALL
	SELECT 236, N'jastrząb', 1, 8 UNION ALL
	SELECT 237, N'Andy', 1, 10 UNION ALL
	SELECT 238, N'Himalaje', 1, 10 UNION ALL
	SELECT 239, N'Alpy', 1, 10 UNION ALL
	SELECT 240, N'Morze Śródziemne', 1, 10 UNION ALL
	SELECT 241, N'Ocean Atlantycki', 1, 10 UNION ALL
	SELECT 242, N'Ocean Spokojny', 1, 10 UNION ALL
	SELECT 243, N'Ocean Indyjski', 1, 10 UNION ALL
	SELECT 244, N'Zatoka Perska', 1, 8 UNION ALL
	SELECT 245, N'Morze Bałtyckie', 1, 10 UNION ALL
	SELECT 246, N'Sardynia', 1, 10 UNION ALL
	SELECT 247, N'Sycylia', 1, 10 UNION ALL
	SELECT 248, N'czarny', 1, 10 UNION ALL
	SELECT 249, N'biały', 1, 10 UNION ALL
	SELECT 250, N'zielony', 1, 10 UNION ALL
	SELECT 251, N'czerwony', 1, 10 UNION ALL
	SELECT 252, N'żółty', 1, 10 UNION ALL
	SELECT 253, N'brązowy', 1, 10 UNION ALL
	SELECT 254, N'niebieski', 1, 10 UNION ALL
	SELECT 255, N'różowy', 1, 10 UNION ALL
	SELECT 256, N'pomarańczowy', 1, 10 UNION ALL
	SELECT 257, N'szary', 1, 10 UNION ALL
	SELECT 258, N'poniedziałek', 1, 10 UNION ALL
	SELECT 259, N'wtorek', 1, 10 UNION ALL
	SELECT 260, N'środa', 1, 10 UNION ALL
	SELECT 261, N'czwartek', 1, 10 UNION ALL
	SELECT 262, N'piątek', 1, 10 UNION ALL
	SELECT 263, N'sobota', 1, 10 UNION ALL
	SELECT 264, N'niedziela', 1, 10 UNION ALL
	SELECT 265, N'styczeń', 1, 10 UNION ALL
	SELECT 266, N'luty', 1, 10 UNION ALL
	SELECT 267, N'marzec', 1, 10 UNION ALL
	SELECT 268, N'kwiecień', 1, 10 UNION ALL
	SELECT 269, N'maj', 1, 10 UNION ALL
	SELECT 270, N'czerwiec', 1, 10 UNION ALL
	SELECT 271, N'lipiec', 1, 10 UNION ALL
	SELECT 272, N'sierpień', 1, 10 UNION ALL
	SELECT 273, N'wrzesień', 1, 10 UNION ALL
	SELECT 274, N'październik', 1, 10 UNION ALL
	SELECT 275, N'listopad', 1, 10 UNION ALL
	SELECT 276, N'grudzień', 1, 10 UNION ALL
	SELECT 277, N'rok', 1, 10 UNION ALL
	SELECT 278, N'miesiąc', 1, 10 UNION ALL
	SELECT 279, N'dzień', 1, 10 UNION ALL
	SELECT 280, N'tydzień', 1, 10 UNION ALL
	SELECT 281, N'godzina', 1, 10 UNION ALL
	SELECT 282, N'minuta', 1, 10 UNION ALL
	SELECT 283, N'sekunda', 1, 10 UNION ALL
	SELECT 284, N'weekend', 1, 8 UNION ALL
	SELECT 285, N'jutro', 1, 10 UNION ALL
	SELECT 286, N'dzisiaj', 1, 10 UNION ALL
	SELECT 287, N'wczoraj', 1, 10 UNION ALL
	SELECT 288, N'żółw', 1, 10 UNION ALL
	SELECT 289, N'krokodyl', 1, 8 UNION ALL
	SELECT 290, N'kangur', 1, 8 UNION ALL
	SELECT 291, N'gad', 1, 9 UNION ALL
	SELECT 292, N'płaz', 1, 9 UNION ALL
	SELECT 293, N'ssak', 1, 9 UNION ALL
	SELECT 294, N'robak', 1, 10 UNION ALL
	SELECT 295, N'owad', 1, 10 UNION ALL
	SELECT 296, N'jabłko', 1, 10 UNION ALL
	SELECT 297, N'gruszka', 1, 10 UNION ALL
	SELECT 298, N'wiśnia', 1, 10 UNION ALL
	SELECT 299, N'truskawka', 1, 10 UNION ALL
	SELECT 300, N'ananas', 1, 9 UNION ALL
	SELECT 301, N'pomarańcza', 1, 10 UNION ALL
	SELECT 302, N'czereśnia', 1, 7 UNION ALL
	SELECT 303, N'porzeczka', 1, 7 UNION ALL
	SELECT 304, N'malina', 1, 9 UNION ALL
	SELECT 305, N'banan', 1, 10 UNION ALL
	SELECT 306, N'robić', 2, 10 UNION ALL
	SELECT 307, N'polski', 3, 10 UNION ALL
	SELECT 308, N'ręka', 1, 10 UNION ALL
	SELECT 309, N'płacić', 2, 10 UNION ALL
	SELECT 310, N'szybki', 3, 10 UNION ALL
	SELECT 311, N'mówić', 2, 10 UNION ALL
	SELECT 312, N'czytać', 2, 10 UNION ALL
	SELECT 313, N'być', 2, 10 UNION ALL
	SELECT 314, N'móc', 2, 10 UNION ALL
	SELECT 315, N'zdobywać', 2, 10 UNION ALL
	SELECT 316, N'próbować', 2, 10 UNION ALL
	SELECT 317, N'książka', 1, 10 UNION ALL
	SELECT 318, N'gra', 1, 10 UNION ALL
	SELECT 319, N'produkt', 1, 10 UNION ALL
	SELECT 320, N'samochód', 1, 10 UNION ALL
	SELECT 321, N'oprogramowanie', 1, 1 UNION ALL
	SELECT 322, N'gubić', 2, 10 UNION ALL
	SELECT 323, N'golić', 2, 8 UNION ALL
	SELECT 324, N'spóźnić', 2, 9 UNION ALL
	SELECT 325, N'poparzyć', 2, 9 UNION ALL
	SELECT 326, N'dowiadywać', 2, 9 UNION ALL
	SELECT 327, N'przeziębić', 2, 7 UNION ALL
	SELECT 328, N'odkręcać', 2, 8 UNION ALL
	SELECT 329, N'zawiązywać', 2, 8 UNION ALL
	SELECT 330, N'nazywać', 2, 8 UNION ALL
	SELECT 331, N'mieć', 2, 10 UNION ALL
	SELECT 332, N'musieć', 2, 10 UNION ALL
	SELECT 333, N'zauważyć', 2, 10 UNION ALL
	SELECT 334, N'popełniać', 2, 10 UNION ALL
	SELECT 335, N'rozmawiać', 2, 10 UNION ALL
	SELECT 336, N'odzyskiwać', 2, 10 UNION ALL
	SELECT 337, N'chcieć', 2, 10 UNION ALL
	SELECT 338, N'dotykać', 2, 10 UNION ALL
	SELECT 339, N'telewizja', 1, 10 UNION ALL
	SELECT 340, N'internet', 1, 10 UNION ALL
	SELECT 341, N'prasa', 1, 10 UNION ALL
	SELECT 342, N'szukać', 2, 10 UNION ALL
	SELECT 343, N'spać', 2, 10 UNION ALL
	SELECT 344, N'rozpoznawać', 2, 10 UNION ALL
	SELECT 345, N'hotel', 1, 10 UNION ALL
	SELECT 346, N'prąd', 1, 10 UNION ALL
	SELECT 347, N'telefon', 1, 10 UNION ALL
	SELECT 348, N'ogrzewanie', 1, 8 UNION ALL
	SELECT 349, N'woda', 1, 10 UNION ALL
	SELECT 350, N'gaz', 1, 10 UNION ALL
	SELECT 351, N'samolot', 1, 10 UNION ALL
	SELECT 352, N'pociąg', 1, 10 UNION ALL
	SELECT 353, N'autobus', 1, 10 UNION ALL
	SELECT 354, N'lekcja', 1, 10 UNION ALL
	SELECT 355, N'dochodzić', 2, 10 UNION ALL
	SELECT 356, N'dostawać', 2, 10 UNION ALL
	SELECT 357, N'pracować', 2, 10 UNION ALL
	SELECT 358, N'słuchać', 2, 10 UNION ALL
	SELECT 359, N'jeździć', 2, 10 UNION ALL
	SELECT 360, N'mieszkać', 2, 10 UNION ALL
	SELECT 361, N'parkować', 2, 8 UNION ALL
	SELECT 362, N'zarabiać', 2, 10 UNION ALL
	SELECT 363, N'biegać', 2, 10 UNION ALL
	SELECT 364, N'wychodzić', 2, 10 UNION ALL
	SELECT 365, N'dotrzeć', 2, 10 UNION ALL
	SELECT 366, N'wyławiać', 2, 8 UNION ALL
	SELECT 367, N'zajmować', 2, 10 UNION ALL
	SELECT 368, N'stawiać', 2, 10 UNION ALL
	SELECT 369, N'dawać', 2, 10 UNION ALL
	SELECT 370, N'wyglądać', 2, 10 UNION ALL
	SELECT 371, N'morze', 1, 10 UNION ALL
	SELECT 372, N'jezioro', 1, 10 UNION ALL
	SELECT 373, N'plaża', 1, 10 UNION ALL
	SELECT 374, N'sam', 3, 10 UNION ALL
	SELECT 375, N'zdążyć', 2, 10 UNION ALL
	SELECT 376, N'słyszeć', 2, 10 UNION ALL
	SELECT 377, N'czuć', 2, 10 UNION ALL
	SELECT 378, N'oczekiwać', 2, 10 UNION ALL
	SELECT 379, N'informować', 2, 10 UNION ALL
	SELECT 380, N'uczyć', 2, 10 UNION ALL
	SELECT 381, N'angielski', 3, 10 UNION ALL
	SELECT 382, N'hiszpański', 3, 10 UNION ALL
	SELECT 383, N'francuski', 3, 10 UNION ALL
	SELECT 384, N'rosyjski', 3, 10 UNION ALL
	SELECT 385, N'włoski', 3, 10 UNION ALL
	SELECT 386, N'portugalski', 3, 10 UNION ALL
	SELECT 387, N'arabski', 3, 10 UNION ALL
	SELECT 388, N'japoński', 3, 10 UNION ALL
	SELECT 389, N'chiński', 3, 10 UNION ALL
	SELECT 390, N'czeski', 3, 7 UNION ALL
	SELECT 391, N'reagować', 2, 10 UNION ALL
	SELECT 392, N'płakać', 2, 10 UNION ALL
	SELECT 393, N'myśleć', 2, 10 UNION ALL
	SELECT 394, N'zachowywać', 2, 10 UNION ALL
	SELECT 395, N'ładny', 3, 10 UNION ALL
	SELECT 396, N'gruziński', 3, 7 UNION ALL
	SELECT 397, N'koreański', 3, 8 UNION ALL
	SELECT 398, N'wietnamski', 3, 7 UNION ALL
	SELECT 399, N'grecki', 3, 8 UNION ALL
	SELECT 400, N'bułgarski', 3, 7 UNION ALL
	SELECT 401, N'albański', 3, 6 UNION ALL
	SELECT 402, N'chorwacki', 3, 8 UNION ALL
	SELECT 403, N'szwajcarski', 3, 10 UNION ALL
	SELECT 404, N'austriacki', 3, 8 UNION ALL
	SELECT 405, N'australijski', 3, 10 UNION ALL
	SELECT 406, N'meksykański', 3, 9 UNION ALL
	SELECT 407, N'brazylijski', 3, 10 UNION ALL
	SELECT 408, N'argentyński', 3, 8 UNION ALL
	SELECT 409, N'kolumbijski', 3, 6 UNION ALL
	SELECT 410, N'kanadyjski', 3, 10 UNION ALL
	SELECT 411, N'amerykański', 3, 10 UNION ALL
	SELECT 412, N'irlandzki', 3, 6 UNION ALL
	SELECT 413, N'szkocki', 3, 4 UNION ALL
	SELECT 414, N'walijski', 3, 4 UNION ALL
	SELECT 415, N'islandzki', 3, 5 UNION ALL
	SELECT 416, N'duński', 3, 8 UNION ALL
	SELECT 417, N'norweski', 3, 7 UNION ALL
	SELECT 418, N'szwedzki', 3, 9 UNION ALL
	SELECT 419, N'fiński', 3, 8 UNION ALL
	SELECT 420, N'estoński', 3, 4 UNION ALL
	SELECT 421, N'łotewski', 3, 4 UNION ALL
	SELECT 422, N'litewski', 3, 5 UNION ALL
	SELECT 423, N'holenderski', 3, 10 UNION ALL
	SELECT 424, N'belgijski', 3, 8 UNION ALL
	SELECT 425, N'słowacki', 3, 6 UNION ALL
	SELECT 426, N'węgierski', 3, 7 UNION ALL
	SELECT 427, N'rumuński', 3, 7 UNION ALL
	SELECT 428, N'serbski', 3, 7 UNION ALL
	SELECT 429, N'macedoński', 3, 4 UNION ALL
	SELECT 430, N'bośniacki', 3, 4 UNION ALL
	SELECT 431, N'słoweński', 3, 4 UNION ALL
	SELECT 432, N'czarnogórski', 3, 5 UNION ALL
	SELECT 433, N'białoruski', 3, 5 UNION ALL
	SELECT 434, N'ukraiński', 3, 8 UNION ALL
	SELECT 435, N'mołdawski', 3, 4 UNION ALL
	SELECT 436, N'peruwiański', 3, 7 UNION ALL
	SELECT 437, N'chilijski', 3, 7 UNION ALL
	SELECT 438, N'wenezuelski', 3, 7 UNION ALL
	SELECT 439, N'urugwajski', 3, 6 UNION ALL
	SELECT 440, N'paragwajski', 3, 7 UNION ALL
	SELECT 441, N'ekwadorski', 3, 5 UNION ALL
	SELECT 442, N'boliwijski', 3, 5 UNION ALL
	SELECT 443, N'surinamski', 3, 2 UNION ALL
	SELECT 444, N'gujański', 3, 2 UNION ALL
	SELECT 445, N'ormiański', 3, 6 UNION ALL
	SELECT 446, N'azerbejdżański', 3, 5 UNION ALL
	SELECT 447, N'turecki', 3, 8 UNION ALL
	SELECT 448, N'jamajski', 3, 5 UNION ALL
	SELECT 449, N'grenlandzki', 3, 5 UNION ALL
	SELECT 450, N'algierski', 3, 5 UNION ALL
	SELECT 451, N'marokański', 3, 6 UNION ALL
	SELECT 452, N'etiopski', 3, 5 UNION ALL
	SELECT 453, N'kenijski', 3, 5 UNION ALL
	SELECT 454, N'malgaski', 3, 4 UNION ALL
	SELECT 455, N'somalijski', 3, 4 UNION ALL
	SELECT 456, N'angolski', 3, 3 UNION ALL
	SELECT 457, N'kameruński', 3, 3 UNION ALL
	SELECT 458, N'gaboński', 3, 2 UNION ALL
	SELECT 459, N'egipski', 3, 6 UNION ALL
	SELECT 460, N'libijski', 3, 5 UNION ALL
	SELECT 461, N'sudański', 3, 3 UNION ALL
	SELECT 462, N'tunezyjski', 3, 5 UNION ALL
	SELECT 463, N'południowoafrykański', 3, 6 UNION ALL
	SELECT 464, N'senegalski', 3, 4 UNION ALL
	SELECT 465, N'nigeryjski', 3, 6 UNION ALL
	SELECT 466, N'nowozelandzki', 3, 7 UNION ALL
	SELECT 467, N'wstawać', 2, 10 UNION ALL
	SELECT 468, N'irański', 3, 6 UNION ALL
	SELECT 469, N'perski', 3, 6 UNION ALL
	SELECT 470, N'iracki', 3, 6 UNION ALL
	SELECT 471, N'pakistański', 3, 7 UNION ALL
	SELECT 472, N'syryjski', 3, 4 UNION ALL
	SELECT 473, N'hinduski', 3, 8 UNION ALL
	SELECT 474, N'libański', 3, 5 UNION ALL
	SELECT 475, N'tajski', 3, 7 UNION ALL
	SELECT 476, N'mongolski', 3, 5 UNION ALL
	SELECT 477, N'twierdzić', 2, 10 UNION ALL
	SELECT 478, N'zamierzać', 2, 10 UNION ALL
	SELECT 479, N'przeżyć', 2, 10 UNION ALL
	SELECT 480, N'rodzić', 2, 10 UNION ALL
	SELECT 481, N'jeden', 3, 10 UNION ALL
	SELECT 482, N'dwa (rzeczy)', 3, 10 UNION ALL
	SELECT 483, N'trzy (rzeczy)', 3, 10 UNION ALL
	SELECT 484, N'cztery (rzeczy)', 3, 10 UNION ALL
	SELECT 485, N'pięć (rzeczy)', 3, 10 UNION ALL
	SELECT 486, N'sześć (rzeczy)', 3, 10 UNION ALL
	SELECT 487, N'szpital', 1, 10 UNION ALL
	SELECT 488, N'szkoła', 1, 10 UNION ALL
	SELECT 489, N'poczta', 1, 10 UNION ALL
	SELECT 490, N'policja', 1, 8 UNION ALL
	SELECT 491, N'wygrywać', 2, 10 UNION ALL
	SELECT 492, N'Oscar', 1, 8 UNION ALL
	SELECT 493, N'Nagroda Nobla', 1, 9 UNION ALL
	SELECT 494, N'strażak', 1, 10 UNION ALL
	SELECT 495, N'lekarz', 1, 9 UNION ALL
	SELECT 496, N'policjant', 1, 9 UNION ALL
	SELECT 497, N'nauczyciel', 1, 9 UNION ALL
	SELECT 498, N'taksówkarz', 1, 9 UNION ALL
	SELECT 499, N'kierowca', 1, 9 UNION ALL
	SELECT 500, N'aplikować', 2, 7 UNION ALL
	SELECT 501, N'mieszkanie', 1, 10 UNION ALL
	SELECT 502, N'pokój', 1, 10 UNION ALL
	SELECT 503, N'przytrzasnąć', 2, 8 UNION ALL
	SELECT 504, N'drzwi', 1, 10 UNION ALL
	SELECT 505, N'okno', 1, 1 UNION ALL
	SELECT 506, N'jeść', 2, 10 UNION ALL
	SELECT 507, N'śniadanie', 1, 10 UNION ALL
	SELECT 508, N'obiad', 1, 10 UNION ALL
	SELECT 509, N'żyć', 2, 10 UNION ALL
	SELECT 510, N'zaczynać', 2, 10 UNION ALL
	SELECT 511, N'tracić', 2, 10 UNION ALL
	SELECT 512, N'wiedzieć', 2, 10 UNION ALL
	SELECT 513, N'stresować', 2, 7 UNION ALL
	SELECT 514, N'głosować', 2, 8 UNION ALL
	SELECT 515, N'ginąć', 2, 10 UNION ALL
	SELECT 516, N'ten', 3, 10 UNION ALL
	SELECT 517, N'dom', 1, 10 UNION ALL
	SELECT 518, N'chodzić', 2, 10 UNION ALL
	SELECT 519, N'brzeg', 1, 9 UNION ALL
	SELECT 520, N'pójść', 2, 10 UNION ALL
	SELECT 521, N'ukrywać', 2, 10 UNION ALL
	SELECT 522, N'iść', 2, 1 UNION ALL
	SELECT 523, N'zapewniać', 2, 10 UNION ALL
	SELECT 524, N'siedzieć', 2, 10 UNION ALL
	SELECT 525, N'powinien', 2, 10 UNION ALL
	SELECT 526, N'brać', 2, 10 UNION ALL
	SELECT 527, N'śmiać', 2, 10 UNION ALL
	SELECT 528, N'las', 1, 10 UNION ALL
	SELECT 529, N'lotnisko', 1, 10 UNION ALL
	SELECT 530, N'rzeka', 1, 10 UNION ALL
	SELECT 531, N'taksówka', 1, 10 UNION ALL
	SELECT 532, N'powstrzymywać', 2, 10 UNION ALL
	SELECT 533, N'prosić', 2, 10 UNION ALL
	SELECT 534, N'uznawać', 2, 9 UNION ALL
	SELECT 535, N'zostać', 2, 10 UNION ALL
	SELECT 536, N'budzić', 2, 10 UNION ALL
	SELECT 537, N'grozić', 2, 10 UNION ALL
	SELECT 538, N'wywiad', 1, 9 UNION ALL
	SELECT 539, N'spotkanie', 1, 9 UNION ALL
	SELECT 540, N'debata', 1, 9 UNION ALL
	SELECT 541, N'widzieć', 2, 10 UNION ALL
	SELECT 542, N'znajdować', 2, 10 UNION ALL
	SELECT 543, N'portfel', 1, 9 UNION ALL
	SELECT 544, N'klucz', 1, 10 UNION ALL
	SELECT 545, N'karta kredytowa', 1, 8 UNION ALL
	SELECT 546, N'lot', 1, 9 UNION ALL
	SELECT 547, N'prezent', 1, 10 UNION ALL
	SELECT 548, N'odpowiedź', 1, 10 UNION ALL
	SELECT 549, N'to', 1, 10 UNION ALL
	SELECT 550, N'komputer', 1, 10 UNION ALL
	SELECT 551, N'odzywać', 2, 10 UNION ALL
	SELECT 552, N'który', 3, 10 UNION ALL
	SELECT 553, N'przypuszczać', 2, 8 UNION ALL
	SELECT 554, N'gazeta', 1, 10 UNION ALL
	SELECT 555, N'dokument', 1, 9 UNION ALL
	SELECT 556, N'wiersz', 1, 8 UNION ALL
	SELECT 557, N'pisać', 2, 10 UNION ALL
	SELECT 558, N'stół', 1, 10 UNION ALL
	SELECT 559, N'krzesło', 1, 10 UNION ALL
	SELECT 560, N'podłoga', 1, 10 UNION ALL
	SELECT 561, N'łóżko', 1, 10 UNION ALL
	SELECT 562, N'kontaktować', 2, 8 UNION ALL
	SELECT 563, N'spotykać', 2, 10 UNION ALL
	SELECT 564, N'uderzać', 2, 10 UNION ALL
	SELECT 565, N'dzielić', 2, 9 UNION ALL
	SELECT 566, N'czekać', 2, 10 UNION ALL
	SELECT 567, N'znać', 2, 10 UNION ALL
	SELECT 568, N'wyjeżdżać', 2, 10 UNION ALL
	SELECT 569, N'gadać', 2, 8 UNION ALL
	SELECT 570, N'nosić', 2, 9 UNION ALL
	SELECT 571, N'brakować', 2, 9 UNION ALL
	SELECT 572, N'podobać', 2, 10 UNION ALL
	SELECT 573, N'porabiać', 2, 7 UNION ALL
	SELECT 574, N'jakiś', 3, 10 UNION ALL
	SELECT 575, N'zbrodnia', 1, 9 UNION ALL
	SELECT 576, N'przestępstwo', 1, 10 UNION ALL
	SELECT 577, N'groźba', 1, 10 UNION ALL
	SELECT 578, N'podpucha', 1, 8 UNION ALL
	SELECT 579, N'żart', 1, 10 UNION ALL
	SELECT 580, N'koncert', 1, 9 UNION ALL
	SELECT 581, N'Średniowiecze', 1, 9 UNION ALL
	SELECT 582, N'wojna domowa', 1, 8 UNION ALL
	SELECT 583, N'finał', 1, 9 UNION ALL
	SELECT 584, N'ten (osobowy)', 3, 10 UNION ALL
	SELECT 585, N'życie', 1, 10 UNION ALL
	SELECT 586, N'przybywać', 2, 8 UNION ALL
	SELECT 587, N'skorpion', 1, 8 UNION ALL
	SELECT 588, N'płaszczka', 1, 7 UNION ALL
	SELECT 589, N'meduza', 1, 8 UNION ALL
	SELECT 590, N'szerszeń', 1, 8 UNION ALL
	SELECT 591, N'kleszcz', 1, 8 UNION ALL
	SELECT 592, N'grzechotnik', 1, 6 UNION ALL
	SELECT 593, N'żmija', 1, 9 UNION ALL
	SELECT 594, N'dowód', 1, 10 UNION ALL
	SELECT 595, N'dane', 1, 9 UNION ALL
	SELECT 596, N'statystyka', 1, 9 UNION ALL
	SELECT 597, N'siedem', 3, 10 UNION ALL
	SELECT 598, N'osiem', 3, 10 UNION ALL
	SELECT 599, N'skóra', 1, 10 UNION ALL
	SELECT 600, N'miejsce', 1, 10 UNION ALL
	SELECT 601, N'wpadać', 2, 10 UNION ALL
	SELECT 602, N'wierzyć', 2, 10 UNION ALL
	SELECT 603, N'potrzebować', 2, 10 UNION ALL
	SELECT 604, N'lubić', 2, 10 UNION ALL
	SELECT 605, N'jedyny', 3, 10 UNION ALL
	SELECT 606, N'ujęcie (zdjęcia)', 1, 8 UNION ALL
	SELECT 607, N'wyjaśnienie', 1, 10 UNION ALL
	SELECT 608, N'powód', 1, 10 UNION ALL
	SELECT 609, N'szansa', 1, 10 UNION ALL
	SELECT 610, N'osoba', 1, 10 UNION ALL
	SELECT 611, N'pytanie', 1, 10 UNION ALL
	SELECT 612, N'wymóg', 1, 9 UNION ALL
	SELECT 613, N'różnica', 1, 10 UNION ALL
	SELECT 614, N'problem', 1, 10 UNION ALL
	SELECT 615, N'wybór', 1, 10 UNION ALL
	SELECT 616, N'mapa', 1, 10 UNION ALL
	SELECT 617, N'wykres', 1, 10 UNION ALL
	SELECT 618, N'założenie', 1, 9 UNION ALL
	SELECT 619, N'wynik (gry, meczu)', 1, 9 UNION ALL
	SELECT 620, N'wynik (badania, pomiaru)', 1, 10 UNION ALL
	SELECT 621, N'zdjęcie', 1, 10 UNION ALL
	SELECT 622, N'młotek', 1, 9 UNION ALL
	SELECT 623, N'lina', 1, 9 UNION ALL
	SELECT 624, N'odwaga', 1, 10 UNION ALL
	SELECT 625, N'przyjaciel', 1, 9 UNION ALL
	SELECT 626, N'zabierać', 2, 7 UNION ALL
	SELECT 627, N'region', 1, 9 UNION ALL
	SELECT 628, N'miasto', 1, 10 UNION ALL
	SELECT 629, N'głowa', 1, 10 UNION ALL
	SELECT 630, N'noga', 1, 10 UNION ALL
	SELECT 631, N'brzuch', 1, 10 UNION ALL
	SELECT 632, N'włos', 1, 10 UNION ALL
	SELECT 633, N'oko', 1, 10 UNION ALL
	SELECT 634, N'ucho', 1, 10 UNION ALL
	SELECT 635, N'nos', 1, 10 UNION ALL
	SELECT 636, N'paznokieć', 1, 7 UNION ALL
	SELECT 637, N'palec', 1, 9 UNION ALL
	SELECT 638, N'ramiona', 1, 9 UNION ALL
	SELECT 639, N'szyja', 1, 9 UNION ALL
	SELECT 640, N'usta', 1, 10 UNION ALL
	SELECT 641, N'ząb', 1, 10 UNION ALL
	SELECT 642, N'język', 1, 10 UNION ALL
	SELECT 643, N'serce', 1, 10 UNION ALL
	SELECT 644, N'wątroba', 1, 8 UNION ALL
	SELECT 645, N'żołądek', 1, 7 UNION ALL
	SELECT 646, N'kolano', 1, 7 UNION ALL
	SELECT 647, N'łokieć', 1, 7 UNION ALL
	SELECT 648, N'stopa', 1, 8 UNION ALL
	SELECT 649, N'pięta', 1, 7 UNION ALL
	SELECT 650, N'policzek', 1, 8 UNION ALL
	SELECT 651, N'brew', 1, 6 UNION ALL
	SELECT 652, N'rzęsa', 1, 6 UNION ALL
	SELECT 653, N'powieka', 1, 6 UNION ALL
	SELECT 654, N'czoło', 1, 8 UNION ALL
	SELECT 655, N'kręgosłup', 1, 8 UNION ALL
	SELECT 656, N'płuco', 1, 8 UNION ALL
	SELECT 657, N'żyła', 1, 9 UNION ALL
	SELECT 658, N'krew', 1, 10 UNION ALL
	SELECT 659, N'gardło', 1, 9 UNION ALL
	SELECT 660, N'mózg', 1, 10
COMMIT;
SET IDENTITY_INSERT [dbo].[Metawords] OFF


GO


-- Matchowanie wyrazów i kategorii
CREATE TABLE [dbo].[MatchWordCategory] (
      [Id]         INT			IDENTITY (1, 1) NOT NULL
    , [MetawordId] INT			NOT NULL
    , [CategoryId] INT			NOT NULL
    , [IsActive]   BIT			DEFAULT ((1)) NOT NULL
    , [CreatorId]  INT			DEFAULT ((1)) NOT NULL
    , [CreateDate] DATETIME		DEFAULT (GETDATE()) NOT NULL
    , [IsApproved] BIT			DEFAULT ((0)) NOT NULL
    , [Positive]   INT			DEFAULT ((0)) NOT NULL
    , [Negative]   INT			DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_MatchWordCategory] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_MatchWordCategory_MetawordId] FOREIGN KEY ([MetawordId]) REFERENCES [dbo].[Metawords] ([Id])
    , CONSTRAINT [FK_MatchWordCategory_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id])
    , CONSTRAINT [FK_MatchWordCategory_User] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
);



SET IDENTITY_INSERT [dbo].[MatchWordCategory] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[MatchWordCategory]([Id], [MetawordId], [CategoryId])
	SELECT 1, 1, 4 UNION ALL
	SELECT 2, 2, 18 UNION ALL
	SELECT 3, 4, 4 UNION ALL
	SELECT 4, 5, 4 UNION ALL
	SELECT 5, 6, 4 UNION ALL
	SELECT 6, 9, 4 UNION ALL
	SELECT 7, 10, 4 UNION ALL
	SELECT 8, 11, 4 UNION ALL
	SELECT 9, 11, 8 UNION ALL
	SELECT 10, 12, 4 UNION ALL
	SELECT 11, 13, 4 UNION ALL
	SELECT 12, 14, 4 UNION ALL
	SELECT 13, 14, 8 UNION ALL
	SELECT 14, 15, 4 UNION ALL
	SELECT 15, 16, 4 UNION ALL
	SELECT 16, 16, 8 UNION ALL
	SELECT 17, 17, 4 UNION ALL
	SELECT 18, 18, 4 UNION ALL
	SELECT 19, 19, 4 UNION ALL
	SELECT 20, 20, 4 UNION ALL
	SELECT 21, 21, 4 UNION ALL
	SELECT 22, 22, 4 UNION ALL
	SELECT 23, 22, 42 UNION ALL
	SELECT 24, 23, 4 UNION ALL
	SELECT 25, 24, 4 UNION ALL
	SELECT 26, 25, 4 UNION ALL
	SELECT 27, 26, 4 UNION ALL
	SELECT 28, 27, 4 UNION ALL
	SELECT 29, 28, 4 UNION ALL
	SELECT 30, 29, 4 UNION ALL
	SELECT 31, 30, 4 UNION ALL
	SELECT 32, 30, 42 UNION ALL
	SELECT 33, 31, 4 UNION ALL
	SELECT 34, 31, 42 UNION ALL
	SELECT 35, 32, 4 UNION ALL
	SELECT 36, 33, 4 UNION ALL
	SELECT 37, 34, 4 UNION ALL
	SELECT 38, 35, 4 UNION ALL
	SELECT 39, 36, 4 UNION ALL
	SELECT 40, 37, 4 UNION ALL
	SELECT 41, 38, 4 UNION ALL
	SELECT 42, 38, 42 UNION ALL
	SELECT 43, 39, 4 UNION ALL
	SELECT 44, 40, 4 UNION ALL
	SELECT 45, 41, 4 UNION ALL
	SELECT 46, 42, 4 UNION ALL
	SELECT 47, 43, 4 UNION ALL
	SELECT 48, 44, 4 UNION ALL
	SELECT 49, 45, 4 UNION ALL
	SELECT 50, 46, 4 UNION ALL
	SELECT 51, 47, 4 UNION ALL
	SELECT 52, 48, 4 UNION ALL
	SELECT 53, 49, 4 UNION ALL
	SELECT 54, 50, 4 UNION ALL
	SELECT 55, 51, 4 UNION ALL
	SELECT 56, 52, 4 UNION ALL
	SELECT 57, 52, 8 UNION ALL
	SELECT 58, 53, 4 UNION ALL
	SELECT 59, 54, 4 UNION ALL
	SELECT 60, 55, 4 UNION ALL
	SELECT 61, 56, 4 UNION ALL
	SELECT 62, 57, 6 UNION ALL
	SELECT 63, 58, 6 UNION ALL
	SELECT 64, 63, 6 UNION ALL
	SELECT 65, 64, 6 UNION ALL
	SELECT 66, 65, 6 UNION ALL
	SELECT 67, 66, 6 UNION ALL
	SELECT 68, 67, 6 UNION ALL
	SELECT 69, 68, 6 UNION ALL
	SELECT 70, 70, 6 UNION ALL
	SELECT 71, 80, 6 UNION ALL
	SELECT 72, 85, 8 UNION ALL
	SELECT 73, 86, 8 UNION ALL
	SELECT 74, 89, 8 UNION ALL
	SELECT 75, 93, 8 UNION ALL
	SELECT 76, 94, 8 UNION ALL
	SELECT 77, 95, 8 UNION ALL
	SELECT 78, 96, 8 UNION ALL
	SELECT 79, 97, 8 UNION ALL
	SELECT 80, 98, 8 UNION ALL
	SELECT 81, 99, 8 UNION ALL
	SELECT 82, 100, 8 UNION ALL
	SELECT 83, 101, 8 UNION ALL
	SELECT 84, 102, 8 UNION ALL
	SELECT 85, 103, 8 UNION ALL
	SELECT 86, 104, 8 UNION ALL
	SELECT 87, 105, 8 UNION ALL
	SELECT 88, 106, 8 UNION ALL
	SELECT 89, 107, 8 UNION ALL
	SELECT 90, 109, 8 UNION ALL
	SELECT 91, 110, 8 UNION ALL
	SELECT 92, 111, 8 UNION ALL
	SELECT 93, 112, 8 UNION ALL
	SELECT 94, 113, 8 UNION ALL
	SELECT 95, 114, 8 UNION ALL
	SELECT 96, 115, 8 UNION ALL
	SELECT 97, 116, 8 UNION ALL
	SELECT 98, 117, 8 UNION ALL
	SELECT 99, 117, 42 UNION ALL
	SELECT 100, 118, 8 UNION ALL
	SELECT 101, 119, 8 UNION ALL
	SELECT 102, 120, 8 UNION ALL
	SELECT 103, 121, 8 UNION ALL
	SELECT 104, 122, 8 UNION ALL
	SELECT 105, 123, 8 UNION ALL
	SELECT 106, 124, 8 UNION ALL
	SELECT 107, 125, 8 UNION ALL
	SELECT 108, 126, 8 UNION ALL
	SELECT 109, 128, 8 UNION ALL
	SELECT 110, 129, 8 UNION ALL
	SELECT 111, 129, 42 UNION ALL
	SELECT 112, 130, 8 UNION ALL
	SELECT 113, 131, 8 UNION ALL
	SELECT 114, 132, 9 UNION ALL
	SELECT 115, 132, 42 UNION ALL
	SELECT 116, 133, 9 UNION ALL
	SELECT 117, 133, 42 UNION ALL
	SELECT 118, 134, 9 UNION ALL
	SELECT 119, 134, 42 UNION ALL
	SELECT 120, 135, 7 UNION ALL
	SELECT 121, 136, 7 UNION ALL
	SELECT 122, 137, 7 UNION ALL
	SELECT 123, 138, 7 UNION ALL
	SELECT 124, 139, 7 UNION ALL
	SELECT 125, 140, 7 UNION ALL
	SELECT 126, 141, 7 UNION ALL
	SELECT 127, 142, 7 UNION ALL
	SELECT 128, 143, 7 UNION ALL
	SELECT 129, 144, 7 UNION ALL
	SELECT 130, 145, 7 UNION ALL
	SELECT 131, 146, 7 UNION ALL
	SELECT 132, 147, 7 UNION ALL
	SELECT 133, 148, 7 UNION ALL
	SELECT 134, 149, 7 UNION ALL
	SELECT 135, 150, 7 UNION ALL
	SELECT 136, 151, 7 UNION ALL
	SELECT 137, 152, 7 UNION ALL
	SELECT 138, 153, 7 UNION ALL
	SELECT 139, 154, 7 UNION ALL
	SELECT 140, 155, 7 UNION ALL
	SELECT 141, 156, 7 UNION ALL
	SELECT 142, 157, 7 UNION ALL
	SELECT 143, 158, 7 UNION ALL
	SELECT 144, 159, 7 UNION ALL
	SELECT 145, 160, 7 UNION ALL
	SELECT 146, 162, 7 UNION ALL
	SELECT 147, 163, 7 UNION ALL
	SELECT 148, 164, 7 UNION ALL
	SELECT 149, 165, 7 UNION ALL
	SELECT 150, 166, 7 UNION ALL
	SELECT 151, 167, 7 UNION ALL
	SELECT 152, 168, 7 UNION ALL
	SELECT 153, 169, 7 UNION ALL
	SELECT 154, 170, 7 UNION ALL
	SELECT 155, 170, 42 UNION ALL
	SELECT 156, 171, 7 UNION ALL
	SELECT 157, 172, 7 UNION ALL
	SELECT 158, 174, 7 UNION ALL
	SELECT 159, 175, 7 UNION ALL
	SELECT 160, 176, 7 UNION ALL
	SELECT 161, 177, 7 UNION ALL
	SELECT 162, 178, 7 UNION ALL
	SELECT 163, 178, 42 UNION ALL
	SELECT 164, 180, 7 UNION ALL
	SELECT 165, 180, 42 UNION ALL
	SELECT 166, 181, 5 UNION ALL
	SELECT 167, 182, 5 UNION ALL
	SELECT 168, 183, 5 UNION ALL
	SELECT 169, 184, 5 UNION ALL
	SELECT 170, 184, 42 UNION ALL
	SELECT 171, 185, 5 UNION ALL
	SELECT 172, 185, 42 UNION ALL
	SELECT 173, 186, 5 UNION ALL
	SELECT 174, 186, 42 UNION ALL
	SELECT 175, 187, 5 UNION ALL
	SELECT 176, 188, 5 UNION ALL
	SELECT 177, 189, 5 UNION ALL
	SELECT 178, 190, 5 UNION ALL
	SELECT 179, 191, 5 UNION ALL
	SELECT 180, 193, 5 UNION ALL
	SELECT 181, 193, 42 UNION ALL
	SELECT 182, 194, 5 UNION ALL
	SELECT 183, 195, 5 UNION ALL
	SELECT 184, 196, 5 UNION ALL
	SELECT 185, 197, 5 UNION ALL
	SELECT 186, 198, 5 UNION ALL
	SELECT 187, 198, 42 UNION ALL
	SELECT 188, 199, 41 UNION ALL
	SELECT 189, 200, 41 UNION ALL
	SELECT 190, 201, 41 UNION ALL
	SELECT 191, 202, 41 UNION ALL
	SELECT 192, 203, 41 UNION ALL
	SELECT 193, 204, 41 UNION ALL
	SELECT 194, 205, 44 UNION ALL
	SELECT 195, 206, 46 UNION ALL
	SELECT 196, 207, 45 UNION ALL
	SELECT 197, 208, 18 UNION ALL
	SELECT 198, 209, 18 UNION ALL
	SELECT 199, 210, 19 UNION ALL
	SELECT 200, 211, 19 UNION ALL
	SELECT 201, 212, 21 UNION ALL
	SELECT 202, 213, 21 UNION ALL
	SELECT 203, 214, 21 UNION ALL
	SELECT 204, 215, 21 UNION ALL
	SELECT 205, 216, 22 UNION ALL
	SELECT 206, 217, 17 UNION ALL
	SELECT 207, 218, 20 UNION ALL
	SELECT 208, 219, 17 UNION ALL
	SELECT 209, 220, 17 UNION ALL
	SELECT 210, 221, 21 UNION ALL
	SELECT 211, 222, 23 UNION ALL
	SELECT 212, 223, 23 UNION ALL
	SELECT 213, 224, 23 UNION ALL
	SELECT 214, 225, 23 UNION ALL
	SELECT 215, 226, 23 UNION ALL
	SELECT 216, 227, 23 UNION ALL
	SELECT 217, 228, 22 UNION ALL
	SELECT 218, 229, 20 UNION ALL
	SELECT 219, 230, 20 UNION ALL
	SELECT 220, 231, 19 UNION ALL
	SELECT 221, 232, 19 UNION ALL
	SELECT 222, 233, 17 UNION ALL
	SELECT 223, 234, 17 UNION ALL
	SELECT 224, 235, 17 UNION ALL
	SELECT 225, 236, 17 UNION ALL
	SELECT 226, 237, 12 UNION ALL
	SELECT 227, 238, 12 UNION ALL
	SELECT 228, 239, 12 UNION ALL
	SELECT 229, 240, 13 UNION ALL
	SELECT 230, 241, 13 UNION ALL
	SELECT 231, 242, 13 UNION ALL
	SELECT 232, 243, 13 UNION ALL
	SELECT 233, 244, 13 UNION ALL
	SELECT 234, 245, 13 UNION ALL
	SELECT 235, 246, 42 UNION ALL
	SELECT 236, 247, 42 UNION ALL
	SELECT 237, 248, 48 UNION ALL
	SELECT 238, 249, 48 UNION ALL
	SELECT 239, 250, 48 UNION ALL
	SELECT 240, 251, 48 UNION ALL
	SELECT 241, 252, 48 UNION ALL
	SELECT 242, 253, 48 UNION ALL
	SELECT 243, 254, 48 UNION ALL
	SELECT 244, 255, 48 UNION ALL
	SELECT 245, 256, 48 UNION ALL
	SELECT 246, 257, 48 UNION ALL
	SELECT 247, 258, 50 UNION ALL
	SELECT 248, 259, 50 UNION ALL
	SELECT 249, 260, 50 UNION ALL
	SELECT 250, 261, 50 UNION ALL
	SELECT 251, 262, 50 UNION ALL
	SELECT 252, 263, 50 UNION ALL
	SELECT 253, 264, 50 UNION ALL
	SELECT 254, 265, 50 UNION ALL
	SELECT 255, 266, 50 UNION ALL
	SELECT 256, 267, 50 UNION ALL
	SELECT 257, 268, 50 UNION ALL
	SELECT 258, 269, 50 UNION ALL
	SELECT 259, 270, 50 UNION ALL
	SELECT 260, 271, 50 UNION ALL
	SELECT 261, 272, 50 UNION ALL
	SELECT 262, 273, 50 UNION ALL
	SELECT 263, 274, 50 UNION ALL
	SELECT 264, 275, 50 UNION ALL
	SELECT 265, 276, 50 UNION ALL
	SELECT 266, 277, 51 UNION ALL
	SELECT 267, 278, 51 UNION ALL
	SELECT 268, 279, 51 UNION ALL
	SELECT 269, 280, 51 UNION ALL
	SELECT 270, 281, 51 UNION ALL
	SELECT 271, 282, 51 UNION ALL
	SELECT 272, 283, 51 UNION ALL
	SELECT 273, 284, 51 UNION ALL
	SELECT 274, 285, 51 UNION ALL
	SELECT 275, 286, 51 UNION ALL
	SELECT 276, 287, 51 UNION ALL
	SELECT 277, 288, 22 UNION ALL
	SELECT 278, 288, 23 UNION ALL
	SELECT 279, 289, 23 UNION ALL
	SELECT 280, 290, 23 UNION ALL
	SELECT 281, 291, 22 UNION ALL
	SELECT 282, 292, 22 UNION ALL
	SELECT 283, 293, 16 UNION ALL
	SELECT 284, 294, 21 UNION ALL
	SELECT 285, 295, 21 UNION ALL
	SELECT 286, 296, 24 UNION ALL
	SELECT 287, 297, 24 UNION ALL
	SELECT 288, 298, 24 UNION ALL
	SELECT 289, 299, 24 UNION ALL
	SELECT 290, 300, 24 UNION ALL
	SELECT 291, 301, 24 UNION ALL
	SELECT 292, 302, 24 UNION ALL
	SELECT 293, 303, 24 UNION ALL
	SELECT 294, 304, 24 UNION ALL
	SELECT 295, 305, 24 UNION ALL
	SELECT 296, 307, 4 UNION ALL
	SELECT 297, 308, 75 UNION ALL
	SELECT 298, 317, 59 UNION ALL
	SELECT 299, 320, 60 UNION ALL
	SELECT 300, 320, 72 UNION ALL
	SELECT 301, 339, 59 UNION ALL
	SELECT 302, 340, 59 UNION ALL
	SELECT 303, 341, 59 UNION ALL
	SELECT 304, 345, 62 UNION ALL
	SELECT 305, 345, 64 UNION ALL
	SELECT 306, 347, 54 UNION ALL
	SELECT 307, 351, 60 UNION ALL
	SELECT 308, 352, 60 UNION ALL
	SELECT 309, 353, 60 UNION ALL
	SELECT 310, 371, 11 UNION ALL
	SELECT 311, 372, 11 UNION ALL
	SELECT 312, 373, 63 UNION ALL
	SELECT 313, 381, 4 UNION ALL
	SELECT 314, 382, 4 UNION ALL
	SELECT 315, 383, 4 UNION ALL
	SELECT 316, 384, 4 UNION ALL
	SELECT 317, 385, 4 UNION ALL
	SELECT 318, 386, 4 UNION ALL
	SELECT 319, 387, 4 UNION ALL
	SELECT 320, 388, 4 UNION ALL
	SELECT 321, 389, 4 UNION ALL
	SELECT 322, 390, 4 UNION ALL
	SELECT 323, 396, 8 UNION ALL
	SELECT 324, 397, 8 UNION ALL
	SELECT 325, 398, 8 UNION ALL
	SELECT 326, 399, 4 UNION ALL
	SELECT 327, 400, 4 UNION ALL
	SELECT 328, 401, 4 UNION ALL
	SELECT 329, 402, 4 UNION ALL
	SELECT 330, 403, 4 UNION ALL
	SELECT 331, 404, 4 UNION ALL
	SELECT 332, 405, 9 UNION ALL
	SELECT 333, 406, 5 UNION ALL
	SELECT 334, 407, 6 UNION ALL
	SELECT 335, 408, 6 UNION ALL
	SELECT 336, 409, 6 UNION ALL
	SELECT 337, 410, 5 UNION ALL
	SELECT 338, 411, 5 UNION ALL
	SELECT 339, 412, 4 UNION ALL
	SELECT 340, 413, 4 UNION ALL
	SELECT 341, 414, 4 UNION ALL
	SELECT 342, 415, 4 UNION ALL
	SELECT 343, 416, 4 UNION ALL
	SELECT 344, 417, 4 UNION ALL
	SELECT 345, 418, 4 UNION ALL
	SELECT 346, 419, 4 UNION ALL
	SELECT 347, 420, 4 UNION ALL
	SELECT 348, 421, 4 UNION ALL
	SELECT 349, 422, 4 UNION ALL
	SELECT 350, 423, 4 UNION ALL
	SELECT 351, 424, 4 UNION ALL
	SELECT 352, 425, 4 UNION ALL
	SELECT 353, 426, 4 UNION ALL
	SELECT 354, 427, 4 UNION ALL
	SELECT 355, 428, 4 UNION ALL
	SELECT 356, 429, 4 UNION ALL
	SELECT 357, 430, 4 UNION ALL
	SELECT 358, 431, 4 UNION ALL
	SELECT 359, 432, 4 UNION ALL
	SELECT 360, 433, 4 UNION ALL
	SELECT 361, 434, 4 UNION ALL
	SELECT 362, 435, 4 UNION ALL
	SELECT 363, 436, 6 UNION ALL
	SELECT 364, 437, 6 UNION ALL
	SELECT 365, 438, 6 UNION ALL
	SELECT 366, 439, 6 UNION ALL
	SELECT 367, 440, 6 UNION ALL
	SELECT 368, 441, 6 UNION ALL
	SELECT 369, 442, 6 UNION ALL
	SELECT 370, 443, 6 UNION ALL
	SELECT 371, 444, 6 UNION ALL
	SELECT 372, 445, 8 UNION ALL
	SELECT 373, 446, 8 UNION ALL
	SELECT 374, 447, 4 UNION ALL
	SELECT 375, 448, 5 UNION ALL
	SELECT 376, 449, 5 UNION ALL
	SELECT 377, 450, 7 UNION ALL
	SELECT 378, 451, 7 UNION ALL
	SELECT 379, 452, 7 UNION ALL
	SELECT 380, 453, 7 UNION ALL
	SELECT 381, 454, 7 UNION ALL
	SELECT 382, 455, 7 UNION ALL
	SELECT 383, 456, 7 UNION ALL
	SELECT 384, 457, 7 UNION ALL
	SELECT 385, 458, 7 UNION ALL
	SELECT 386, 459, 7 UNION ALL
	SELECT 387, 460, 7 UNION ALL
	SELECT 388, 461, 7 UNION ALL
	SELECT 389, 462, 7 UNION ALL
	SELECT 390, 463, 7 UNION ALL
	SELECT 391, 464, 7 UNION ALL
	SELECT 392, 465, 7 UNION ALL
	SELECT 393, 466, 9 UNION ALL
	SELECT 394, 468, 8 UNION ALL
	SELECT 395, 469, 8 UNION ALL
	SELECT 396, 470, 8 UNION ALL
	SELECT 397, 471, 8 UNION ALL
	SELECT 398, 472, 8 UNION ALL
	SELECT 399, 473, 8 UNION ALL
	SELECT 400, 474, 8 UNION ALL
	SELECT 401, 475, 8 UNION ALL
	SELECT 402, 476, 8 UNION ALL
	SELECT 403, 487, 62 UNION ALL
	SELECT 404, 487, 64 UNION ALL
	SELECT 405, 488, 62 UNION ALL
	SELECT 406, 488, 64 UNION ALL
	SELECT 407, 489, 62 UNION ALL
	SELECT 408, 489, 64 UNION ALL
	SELECT 409, 490, 62 UNION ALL
	SELECT 410, 492, 78 UNION ALL
	SELECT 411, 493, 78 UNION ALL
	SELECT 412, 494, 28 UNION ALL
	SELECT 413, 495, 28 UNION ALL
	SELECT 414, 496, 28 UNION ALL
	SELECT 415, 497, 28 UNION ALL
	SELECT 416, 498, 28 UNION ALL
	SELECT 417, 499, 28 UNION ALL
	SELECT 418, 504, 72 UNION ALL
	SELECT 419, 505, 72 UNION ALL
	SELECT 420, 507, 71 UNION ALL
	SELECT 421, 508, 71 UNION ALL
	SELECT 422, 519, 63 UNION ALL
	SELECT 423, 519, 63 UNION ALL
	SELECT 424, 528, 63 UNION ALL
	SELECT 425, 529, 62 UNION ALL
	SELECT 426, 529, 64 UNION ALL
	SELECT 427, 530, 63 UNION ALL
	SELECT 428, 531, 60 UNION ALL
	SELECT 429, 538, 77 UNION ALL
	SELECT 430, 539, 77 UNION ALL
	SELECT 431, 540, 77 UNION ALL
	SELECT 432, 543, 72 UNION ALL
	SELECT 433, 544, 72 UNION ALL
	SELECT 434, 545, 72 UNION ALL
	SELECT 435, 547, 72 UNION ALL
	SELECT 436, 550, 72 UNION ALL
	SELECT 437, 554, 72 UNION ALL
	SELECT 438, 555, 77 UNION ALL
	SELECT 439, 556, 67 UNION ALL
	SELECT 440, 558, 72 UNION ALL
	SELECT 441, 558, 56 UNION ALL
	SELECT 442, 559, 72 UNION ALL
	SELECT 443, 559, 58 UNION ALL
	SELECT 444, 560, 72 UNION ALL
	SELECT 445, 560, 58 UNION ALL
	SELECT 446, 561, 72 UNION ALL
	SELECT 447, 561, 58 UNION ALL
	SELECT 448, 576, 80 UNION ALL
	SELECT 449, 577, 80 UNION ALL
	SELECT 450, 579, 65 UNION ALL
	SELECT 451, 580, 67 UNION ALL
	SELECT 452, 587, 21 UNION ALL
	SELECT 453, 588, 20 UNION ALL
	SELECT 454, 589, 21 UNION ALL
	SELECT 455, 590, 21 UNION ALL
	SELECT 456, 591, 21 UNION ALL
	SELECT 457, 592, 22 UNION ALL
	SELECT 458, 593, 22 UNION ALL
	SELECT 459, 594, 77 UNION ALL
	SELECT 460, 595, 77 UNION ALL
	SELECT 461, 596, 77 UNION ALL
	SELECT 462, 599, 75 UNION ALL
	SELECT 463, 616, 74 UNION ALL
	SELECT 464, 617, 77 UNION ALL
	SELECT 465, 619, 77 UNION ALL
	SELECT 466, 620, 77 UNION ALL
	SELECT 467, 621, 72 UNION ALL
	SELECT 468, 622, 73 UNION ALL
	SELECT 469, 623, 73 UNION ALL
	SELECT 470, 627, 63 UNION ALL
	SELECT 471, 628, 63 UNION ALL
	SELECT 472, 629, 75 UNION ALL
	SELECT 473, 630, 75 UNION ALL
	SELECT 474, 631, 75 UNION ALL
	SELECT 475, 632, 75 UNION ALL
	SELECT 476, 633, 75 UNION ALL
	SELECT 477, 634, 75 UNION ALL
	SELECT 478, 635, 75 UNION ALL
	SELECT 479, 636, 75 UNION ALL
	SELECT 480, 637, 75 UNION ALL
	SELECT 481, 638, 75 UNION ALL
	SELECT 482, 639, 75 UNION ALL
	SELECT 483, 640, 75 UNION ALL
	SELECT 484, 641, 75 UNION ALL
	SELECT 485, 642, 75 UNION ALL
	SELECT 486, 643, 75 UNION ALL
	SELECT 487, 644, 75 UNION ALL
	SELECT 488, 645, 75 UNION ALL
	SELECT 489, 646, 75 UNION ALL
	SELECT 490, 647, 75 UNION ALL
	SELECT 491, 648, 75 UNION ALL
	SELECT 492, 649, 75 UNION ALL
	SELECT 493, 650, 75 UNION ALL
	SELECT 494, 651, 75 UNION ALL
	SELECT 495, 652, 75 UNION ALL
	SELECT 496, 653, 75 UNION ALL
	SELECT 497, 654, 75 UNION ALL
	SELECT 498, 655, 75 UNION ALL
	SELECT 499, 656, 75 UNION ALL
	SELECT 500, 657, 75 UNION ALL
	SELECT 501, 658, 75 UNION ALL
	SELECT 502, 659, 75 UNION ALL
	SELECT 503, 660, 75
COMMIT;
SET IDENTITY_INSERT [dbo].[MatchWordCategory] OFF


GO


-- Wyrazy
CREATE TABLE [dbo].[Words] (
      [Id]         INT            IDENTITY (1, 1) NOT NULL
    , [MetawordId] INT            NOT NULL
    , [LanguageId] INT            NOT NULL
    , [Name]       NVARCHAR (255) NOT NULL
    , [Weight]     INT            DEFAULT ((1)) NOT NULL
    , [IsActive]   BIT            DEFAULT ((1)) NOT NULL
    , [CreatorId]  INT            DEFAULT ((1)) NOT NULL
    , [CreateDate] DATETIME       DEFAULT (GETDATE()) NOT NULL
    , [IsApproved] BIT            DEFAULT ((0)) NOT NULL
    , [Positive]   INT            DEFAULT ((0)) NOT NULL
    , [Negative]   INT            DEFAULT ((0)) NOT NULL
	, [IsCompleted] BIT			  DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_Words] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_Words_WordContentForMetaword] UNIQUE NONCLUSTERED ([MetawordId] ASC, [LanguageId] ASC, [Name] ASC)
    , CONSTRAINT [FK_Words_Metaword] FOREIGN KEY ([MetawordId]) REFERENCES [dbo].[Metawords] ([Id])
    , CONSTRAINT [FK_WordLanguage] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_WordCreator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [CH_WordWeight] CHECK ([Weight] > (0) AND [Weight] <= (10))
);

SET IDENTITY_INSERT [dbo].[Words] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Words]([Id], [MetawordId], [LanguageId], [Name], [Weight], [IsCompleted])
	SELECT 1, 1, 1, 'Polska', 10, 1 UNION ALL
	SELECT 2, 1, 2, 'Poland', 10, 1 UNION ALL
	SELECT 3, 2, 1, 'pies', 10, 1 UNION ALL
	SELECT 4, 1, 3, 'Polonia', 10, 0 UNION ALL
	SELECT 5, 1, 4, 'Polonia', 10, 0 UNION ALL
	SELECT 6, 2, 2, 'dog', 10, 1 UNION ALL
	SELECT 7, 2, 3, 'perro', 10, 0 UNION ALL
	SELECT 8, 2, 4, 'cane', 10, 0 UNION ALL
	SELECT 11, 4, 1, 'Włochy', 10, 1 UNION ALL
	SELECT 12, 4, 2, 'Italy', 10, 1 UNION ALL
	SELECT 13, 4, 3, 'Italia', 10, 0 UNION ALL
	SELECT 14, 4, 4, 'Italia', 10, 0 UNION ALL
	SELECT 15, 5, 1, 'Hiszpania', 10, 1 UNION ALL
	SELECT 16, 5, 2, 'Spain', 10, 1 UNION ALL
	SELECT 17, 5, 3, 'España', 10, 0 UNION ALL
	SELECT 18, 5, 4, 'Spagna', 10, 0 UNION ALL
	SELECT 19, 6, 1, 'Francja', 10, 1 UNION ALL
	SELECT 20, 6, 2, 'France', 10, 1 UNION ALL
	SELECT 21, 6, 3, 'Francia', 10, 0 UNION ALL
	SELECT 22, 6, 4, 'Francia', 10, 0 UNION ALL
	SELECT 23, 9, 1, 'Niemcy', 10, 1 UNION ALL
	SELECT 24, 9, 2, 'Germany', 10, 1 UNION ALL
	SELECT 25, 9, 3, 'Alemania', 10, 0 UNION ALL
	SELECT 26, 9, 4, 'Germania', 10, 0 UNION ALL
	SELECT 27, 10, 1, 'Anglia', 10, 1 UNION ALL
	SELECT 28, 10, 2, 'England', 10, 1 UNION ALL
	SELECT 29, 10, 3, 'Inglaterra', 10, 0 UNION ALL
	SELECT 30, 10, 4, 'Inghilterra', 10, 0 UNION ALL
	SELECT 31, 11, 1, 'Rosja', 10, 1 UNION ALL
	SELECT 32, 11, 2, 'Russia', 10, 1 UNION ALL
	SELECT 33, 11, 3, 'Rusia', 10, 0 UNION ALL
	SELECT 34, 11, 4, 'Russia', 10, 0 UNION ALL
	SELECT 35, 12, 1, 'Albania', 10, 1 UNION ALL
	SELECT 36, 12, 2, 'Albania', 10, 1 UNION ALL
	SELECT 37, 12, 3, 'Albania', 10, 0 UNION ALL
	SELECT 38, 12, 4, 'Albania', 10, 0 UNION ALL
	SELECT 40, 13, 1, 'Andora', 10, 1 UNION ALL
	SELECT 41, 14, 1, 'Armenia', 10, 1 UNION ALL
	SELECT 42, 15, 1, 'Austria', 10, 1 UNION ALL
	SELECT 43, 16, 1, 'Azerbejdżan', 10, 1 UNION ALL
	SELECT 44, 17, 1, 'Białoruś', 10, 1 UNION ALL
	SELECT 45, 18, 1, 'Belgia', 10, 1 UNION ALL
	SELECT 46, 19, 1, 'Bośnia i Hercegowina', 10, 1 UNION ALL
	SELECT 47, 20, 1, 'Bułgaria', 10, 1 UNION ALL
	SELECT 48, 21, 1, 'Chorwacja', 10, 1 UNION ALL
	SELECT 49, 22, 1, 'Cypr', 10, 1 UNION ALL
	SELECT 50, 23, 1, 'Czechy', 10, 1 UNION ALL
	SELECT 51, 24, 1, 'Dania', 10, 1 UNION ALL
	SELECT 52, 25, 1, 'Estonia', 10, 1 UNION ALL
	SELECT 53, 26, 1, 'Finlandia', 10, 1 UNION ALL
	SELECT 54, 27, 1, 'Gruzja', 10, 1 UNION ALL
	SELECT 55, 28, 1, 'Grecja', 10, 1 UNION ALL
	SELECT 56, 29, 1, 'Węgry', 10, 1 UNION ALL
	SELECT 57, 30, 1, 'Islandia', 10, 1 UNION ALL
	SELECT 58, 31, 1, 'Irlandia', 10, 1 UNION ALL
	SELECT 59, 32, 1, 'Kazachstan', 10, 1 UNION ALL
	SELECT 60, 33, 1, 'Łotwa', 10, 1 UNION ALL
	SELECT 61, 34, 1, 'Liechtenstein', 10, 1 UNION ALL
	SELECT 62, 35, 1, 'Litwa', 10, 1 UNION ALL
	SELECT 63, 36, 1, 'Luksemburg', 10, 1 UNION ALL
	SELECT 64, 37, 1, 'Macedonia', 10, 1 UNION ALL
	SELECT 65, 38, 1, 'Malta', 10, 1 UNION ALL
	SELECT 66, 39, 1, 'Mołdawia', 10, 1 UNION ALL
	SELECT 67, 40, 1, 'Monako', 10, 1 UNION ALL
	SELECT 68, 41, 1, 'Czarnogóra', 10, 1 UNION ALL
	SELECT 69, 42, 1, 'Holandia', 10, 1 UNION ALL
	SELECT 70, 43, 1, 'Norwegia', 10, 1 UNION ALL
	SELECT 71, 44, 1, 'Portugalia', 10, 1 UNION ALL
	SELECT 72, 45, 1, 'Rumunia', 10, 1 UNION ALL
	SELECT 73, 46, 1, 'San Marino', 10, 1 UNION ALL
	SELECT 74, 47, 1, 'Serbia', 10, 1 UNION ALL
	SELECT 75, 48, 1, 'Słowacja', 10, 1 UNION ALL
	SELECT 76, 49, 1, 'Słowenia', 10, 1 UNION ALL
	SELECT 77, 50, 1, 'Szwecja', 10, 1 UNION ALL
	SELECT 78, 51, 1, 'Szwajcaria', 10, 1 UNION ALL
	SELECT 79, 52, 1, 'Turcja', 10, 1 UNION ALL
	SELECT 80, 53, 1, 'Ukraina', 10, 1 UNION ALL
	SELECT 81, 54, 1, 'Wielka Brytania', 10, 1 UNION ALL
	SELECT 82, 55, 1, 'Watykan', 10, 1 UNION ALL
	SELECT 83, 56, 1, 'Szkocja', 10, 1 UNION ALL
	SELECT 85, 13, 2, 'Andorra', 10, 1 UNION ALL
	SELECT 86, 14, 2, 'Armenia', 10, 1 UNION ALL
	SELECT 87, 15, 2, 'Austria', 10, 1 UNION ALL
	SELECT 88, 16, 2, 'Azerbaijan', 10, 1 UNION ALL
	SELECT 89, 17, 2, 'Belarus', 10, 1 UNION ALL
	SELECT 90, 18, 2, 'Belgium', 10, 1 UNION ALL
	SELECT 91, 19, 2, 'Bosnia and Herzegovina', 10, 1 UNION ALL
	SELECT 92, 20, 2, 'Bulgaria', 10, 1 UNION ALL
	SELECT 93, 21, 2, 'Croatia', 10, 1 UNION ALL
	SELECT 94, 22, 2, 'Cyprus', 10, 1 UNION ALL
	SELECT 95, 23, 2, 'Czech Republic', 10, 1 UNION ALL
	SELECT 96, 24, 2, 'Denmark', 10, 1 UNION ALL
	SELECT 97, 25, 2, 'Estonia', 10, 1 UNION ALL
	SELECT 98, 26, 2, 'Finland', 10, 1 UNION ALL
	SELECT 99, 27, 2, 'Georgia', 10, 1 UNION ALL
	SELECT 100, 28, 2, 'Greece', 10, 1 UNION ALL
	SELECT 101, 29, 2, 'Hungary', 10, 1 UNION ALL
	SELECT 102, 30, 2, 'Iceland', 10, 1 UNION ALL
	SELECT 103, 31, 2, 'Republic of Ireland', 5, 1 UNION ALL
	SELECT 104, 32, 2, 'Kazakhstan', 10, 1 UNION ALL
	SELECT 105, 33, 2, 'Latvia', 10, 1 UNION ALL
	SELECT 106, 34, 2, 'Liechtenstein', 10, 1 UNION ALL
	SELECT 107, 35, 2, 'Lithuania', 10, 1 UNION ALL
	SELECT 108, 36, 2, 'Luxembourg', 10, 1 UNION ALL
	SELECT 109, 37, 2, 'Macedonia', 10, 1 UNION ALL
	SELECT 110, 38, 2, 'Malta', 10, 1 UNION ALL
	SELECT 111, 39, 2, 'Moldova', 10, 1 UNION ALL
	SELECT 112, 40, 2, 'Monaco', 10, 1 UNION ALL
	SELECT 113, 41, 2, 'Montenegro', 10, 1 UNION ALL
	SELECT 114, 42, 2, 'the Netherlands', 10, 1 UNION ALL
	SELECT 115, 43, 2, 'Norway', 10, 1 UNION ALL
	SELECT 116, 44, 2, 'Portugal', 10, 1 UNION ALL
	SELECT 117, 45, 2, 'Romania', 10, 1 UNION ALL
	SELECT 118, 46, 2, 'San Marino', 10, 1 UNION ALL
	SELECT 119, 47, 2, 'Serbia', 10, 1 UNION ALL
	SELECT 120, 48, 2, 'Slovakia', 10, 1 UNION ALL
	SELECT 121, 49, 2, 'Slovenia', 10, 1 UNION ALL
	SELECT 122, 50, 2, 'Sweden', 10, 1 UNION ALL
	SELECT 123, 51, 2, 'Switzerland', 10, 1 UNION ALL
	SELECT 124, 52, 2, 'Turkey', 10, 1 UNION ALL
	SELECT 125, 53, 2, 'Ukraine', 10, 1 UNION ALL
	SELECT 126, 54, 2, 'United Kingdom', 10, 1 UNION ALL
	SELECT 127, 55, 2, 'Vatican City', 5, 1 UNION ALL
	SELECT 128, 56, 2, 'Scotland', 10, 1 UNION ALL
	SELECT 130, 13, 3, 'Andorra', 10, 0 UNION ALL
	SELECT 131, 14, 3, 'Armenia', 10, 0 UNION ALL
	SELECT 132, 15, 3, 'Austria', 10, 0 UNION ALL
	SELECT 133, 16, 3, 'Azerbaiyán', 10, 0 UNION ALL
	SELECT 134, 17, 3, 'Bielorrusia', 10, 0 UNION ALL
	SELECT 135, 18, 3, 'Bélgica', 10, 0 UNION ALL
	SELECT 136, 19, 3, 'Bosnia-Herzegovina', 10, 0 UNION ALL
	SELECT 137, 20, 3, 'Bulgaria', 10, 0 UNION ALL
	SELECT 138, 21, 3, 'Croacia', 10, 0 UNION ALL
	SELECT 139, 22, 3, 'Chipre', 10, 0 UNION ALL
	SELECT 140, 23, 3, 'República Checa', 10, 0 UNION ALL
	SELECT 141, 24, 3, 'Dinamarca', 10, 0 UNION ALL
	SELECT 142, 25, 3, 'Estonia', 10, 0 UNION ALL
	SELECT 143, 26, 3, 'Finlandia', 10, 0 UNION ALL
	SELECT 144, 27, 3, 'Georgia', 10, 0 UNION ALL
	SELECT 145, 28, 3, 'Grecia', 10, 0 UNION ALL
	SELECT 146, 29, 3, 'Hungría', 10, 0 UNION ALL
	SELECT 147, 30, 3, 'Islandia', 10, 0 UNION ALL
	SELECT 148, 31, 3, 'Irlanda', 10, 0 UNION ALL
	SELECT 149, 32, 3, 'Kazajistán', 10, 0 UNION ALL
	SELECT 150, 33, 3, 'Letonia', 10, 0 UNION ALL
	SELECT 151, 34, 3, 'Liechtenstein', 10, 0 UNION ALL
	SELECT 152, 35, 3, 'Lituania', 10, 0 UNION ALL
	SELECT 153, 36, 3, 'Luxemburgo', 10, 0 UNION ALL
	SELECT 154, 37, 3, 'Macedonia', 10, 0 UNION ALL
	SELECT 155, 38, 3, 'Malta', 10, 0 UNION ALL
	SELECT 156, 39, 3, 'Moldavia', 10, 0 UNION ALL
	SELECT 157, 40, 3, 'Mónaco', 10, 0 UNION ALL
	SELECT 158, 41, 3, 'Montenegro', 10, 0 UNION ALL
	SELECT 159, 42, 3, 'Países Bajos', 10, 0 UNION ALL
	SELECT 160, 43, 3, 'Noruega', 10, 0 UNION ALL
	SELECT 161, 44, 3, 'Portugal', 10, 0 UNION ALL
	SELECT 162, 45, 3, 'Rumania', 10, 0 UNION ALL
	SELECT 163, 46, 3, 'San Marino', 10, 0 UNION ALL
	SELECT 164, 47, 3, 'Serbia', 10, 0 UNION ALL
	SELECT 165, 48, 3, 'Eslovaquia', 10, 0 UNION ALL
	SELECT 166, 49, 3, 'Eslovenia', 10, 0 UNION ALL
	SELECT 167, 50, 3, 'Suecia', 10, 0 UNION ALL
	SELECT 168, 51, 3, 'Suiza', 10, 0 UNION ALL
	SELECT 169, 52, 3, 'Turquía', 10, 0 UNION ALL
	SELECT 170, 53, 3, 'Ucrania', 10, 0 UNION ALL
	SELECT 171, 54, 3, 'Reino Unido', 10, 0 UNION ALL
	SELECT 172, 55, 3, 'Ciudad del Vaticano', 10, 0 UNION ALL
	SELECT 173, 56, 3, 'Escocia', 10, 0 UNION ALL
	SELECT 175, 13, 4, 'Andorra', 10, 0 UNION ALL
	SELECT 176, 14, 4, 'Armenia', 10, 0 UNION ALL
	SELECT 177, 15, 4, 'Austria', 10, 0 UNION ALL
	SELECT 178, 16, 4, 'Azerbaigian', 10, 0 UNION ALL
	SELECT 179, 17, 4, 'Bielorussia', 10, 0 UNION ALL
	SELECT 180, 18, 4, 'Belgio', 10, 0 UNION ALL
	SELECT 181, 19, 4, 'Bosnia ed Erzegovina', 10, 0 UNION ALL
	SELECT 182, 20, 4, 'Bulgaria', 10, 0 UNION ALL
	SELECT 183, 21, 4, 'Croazia', 10, 0 UNION ALL
	SELECT 184, 22, 4, 'Cipro', 10, 0 UNION ALL
	SELECT 185, 23, 4, 'Repubblica Ceca', 10, 0 UNION ALL
	SELECT 186, 24, 4, 'Danimarca', 10, 0 UNION ALL
	SELECT 187, 25, 4, 'Estonia', 10, 0 UNION ALL
	SELECT 188, 26, 4, 'Finlandia', 10, 0 UNION ALL
	SELECT 189, 27, 4, 'Georgia', 10, 0 UNION ALL
	SELECT 190, 28, 4, 'Grecia', 10, 0 UNION ALL
	SELECT 191, 29, 4, 'Ungheria', 10, 0 UNION ALL
	SELECT 192, 30, 4, 'Islanda', 10, 0 UNION ALL
	SELECT 193, 31, 4, 'Irlanda', 10, 0 UNION ALL
	SELECT 194, 32, 4, 'Kazakistan', 10, 0 UNION ALL
	SELECT 195, 33, 4, 'Lettonia', 10, 0 UNION ALL
	SELECT 196, 34, 4, 'Liechtenstein', 10, 0 UNION ALL
	SELECT 197, 35, 4, 'Lituania', 10, 0 UNION ALL
	SELECT 198, 36, 4, 'Lussemburgo', 10, 0 UNION ALL
	SELECT 199, 37, 4, 'Macedonia', 10, 0 UNION ALL
	SELECT 200, 38, 4, 'Malta', 10, 0 UNION ALL
	SELECT 201, 39, 4, 'Moldavia', 10, 0 UNION ALL
	SELECT 202, 40, 4, 'Monaco', 10, 0 UNION ALL
	SELECT 203, 41, 4, 'Montenegro', 10, 0 UNION ALL
	SELECT 204, 42, 4, 'Paesi Bassi', 10, 0 UNION ALL
	SELECT 205, 43, 4, 'Norvegia', 10, 0 UNION ALL
	SELECT 206, 44, 4, 'Portogallo', 10, 0 UNION ALL
	SELECT 207, 45, 4, 'Romania', 10, 0 UNION ALL
	SELECT 208, 46, 4, 'San Marino', 10, 0 UNION ALL
	SELECT 209, 47, 4, 'Serbia', 10, 0 UNION ALL
	SELECT 210, 48, 4, 'Slovacchia', 10, 0 UNION ALL
	SELECT 211, 49, 4, 'Slovenia', 10, 0 UNION ALL
	SELECT 212, 50, 4, 'Svezia', 10, 0 UNION ALL
	SELECT 213, 51, 4, 'Svizzera', 10, 0 UNION ALL
	SELECT 214, 52, 4, 'Turchia', 10, 0 UNION ALL
	SELECT 215, 53, 4, 'Ucraina', 10, 0 UNION ALL
	SELECT 216, 54, 4, 'Regno Unito', 10, 0 UNION ALL
	SELECT 217, 55, 4, 'Città del Vaticano', 10, 0 UNION ALL
	SELECT 218, 56, 4, 'Scozia', 10, 0 UNION ALL
	SELECT 219, 57, 1, 'Brazylia', 10, 1 UNION ALL
	SELECT 220, 57, 2, 'Brazil', 10, 1 UNION ALL
	SELECT 221, 57, 3, 'Brasil', 10, 0 UNION ALL
	SELECT 222, 57, 4, 'Brasile', 10, 0 UNION ALL
	SELECT 223, 58, 1, 'Argentyna', 10, 1 UNION ALL
	SELECT 224, 58, 2, 'Argentina', 10, 1 UNION ALL
	SELECT 225, 58, 3, 'Argentina', 10, 0 UNION ALL
	SELECT 226, 58, 4, 'Argentina', 10, 0 UNION ALL
	SELECT 227, 80, 1, 'Ekwador', 10, 1 UNION ALL
	SELECT 228, 70, 1, 'Paragwaj', 10, 1 UNION ALL
	SELECT 229, 70, 2, 'Paraguay', 10, 1 UNION ALL
	SELECT 230, 80, 2, 'Ecuador', 10, 1 UNION ALL
	SELECT 231, 80, 3, 'Ecuador', 10, 0 UNION ALL
	SELECT 232, 80, 4, 'Ecuador', 10, 0 UNION ALL
	SELECT 233, 70, 3, 'Paraguay', 10, 0 UNION ALL
	SELECT 234, 70, 4, 'Paraguay', 10, 0 UNION ALL
	SELECT 235, 68, 1, 'Urugwaj', 10, 1 UNION ALL
	SELECT 236, 68, 2, 'Uruguay', 10, 1 UNION ALL
	SELECT 237, 68, 3, 'Uruguay', 10, 0 UNION ALL
	SELECT 238, 68, 4, 'Uruguay', 10, 0 UNION ALL
	SELECT 239, 67, 1, 'Wenezuela', 10, 1 UNION ALL
	SELECT 240, 67, 2, 'Venezuela', 10, 1 UNION ALL
	SELECT 241, 67, 3, 'Venezuela', 10, 0 UNION ALL
	SELECT 242, 67, 4, 'Venezuela', 10, 0 UNION ALL
	SELECT 243, 66, 1, 'Kolumbia', 10, 1 UNION ALL
	SELECT 244, 66, 2, 'Colombia', 10, 1 UNION ALL
	SELECT 245, 66, 3, 'Colombia', 10, 0 UNION ALL
	SELECT 246, 66, 4, 'Colombia', 10, 0 UNION ALL
	SELECT 247, 65, 1, 'Chile', 10, 1 UNION ALL
	SELECT 248, 65, 2, 'Chile', 10, 1 UNION ALL
	SELECT 249, 65, 3, 'Chile', 10, 0 UNION ALL
	SELECT 250, 65, 4, 'Cile', 10, 0 UNION ALL
	SELECT 251, 64, 1, 'Boliwia', 10, 1 UNION ALL
	SELECT 252, 64, 2, 'Bolivia', 10, 1 UNION ALL
	SELECT 253, 64, 3, 'Bolivia', 10, 0 UNION ALL
	SELECT 254, 64, 4, 'Bolivia', 10, 0 UNION ALL
	SELECT 255, 63, 1, 'Peru', 10, 1 UNION ALL
	SELECT 256, 63, 2, 'Peru', 10, 1 UNION ALL
	SELECT 257, 63, 3, 'Perú', 10, 0 UNION ALL
	SELECT 258, 63, 4, 'Perù', 10, 0 UNION ALL
	SELECT 259, 85, 1, 'Chiny', 10, 1 UNION ALL
	SELECT 260, 85, 2, 'China', 10, 1 UNION ALL
	SELECT 261, 86, 1, 'Japonia', 10, 1 UNION ALL
	SELECT 262, 86, 2, 'Japan', 10, 1 UNION ALL
	SELECT 263, 89, 1, 'Indie', 10, 1 UNION ALL
	SELECT 264, 89, 2, 'India', 10, 1 UNION ALL
	SELECT 266, 182, 1, 'Kanada', 10, 1 UNION ALL
	SELECT 267, 182, 2, 'Canada', 10, 1 UNION ALL
	SELECT 277, 198, 1, 'Bahamy', 10, 1 UNION ALL
	SELECT 287, 197, 1, 'Belize', 10, 1 UNION ALL
	SELECT 288, 93, 1, 'Tajlandia', 10, 1 UNION ALL
	SELECT 289, 93, 2, 'Thailand', 10, 1 UNION ALL
	SELECT 290, 94, 1, 'Izrael', 10, 1 UNION ALL
	SELECT 291, 94, 2, 'Israel', 10, 1 UNION ALL
	SELECT 292, 95, 1, 'Liban', 10, 1 UNION ALL
	SELECT 293, 95, 2, 'Lebanon', 10, 1 UNION ALL
	SELECT 294, 96, 1, 'Jordania', 10, 1 UNION ALL
	SELECT 295, 96, 2, 'Jordan', 10, 1 UNION ALL
	SELECT 296, 97, 1, 'Syria', 10, 1 UNION ALL
	SELECT 297, 97, 2, 'Syria', 10, 1 UNION ALL
	SELECT 298, 98, 1, 'Arabia Saudyjska', 10, 1 UNION ALL
	SELECT 299, 98, 2, 'Saudi Arabia', 10, 1 UNION ALL
	SELECT 300, 99, 1, 'Jemen', 10, 1 UNION ALL
	SELECT 301, 99, 2, 'Yemen', 10, 1 UNION ALL
	SELECT 302, 100, 1, 'Oman', 10, 1 UNION ALL
	SELECT 303, 100, 2, 'Oman', 10, 1 UNION ALL
	SELECT 304, 101, 1, 'Zjednoczone Emiraty Arabskie', 10, 1 UNION ALL
	SELECT 305, 101, 2, 'United Arab Emirates', 10, 1 UNION ALL
	SELECT 306, 101, 2, 'UAE', 10, 1 UNION ALL
	SELECT 307, 102, 1, 'Kuwejt', 10, 1 UNION ALL
	SELECT 308, 102, 2, 'Kuwait', 10, 1 UNION ALL
	SELECT 309, 193, 1, 'Dominikana', 10, 1 UNION ALL
	SELECT 310, 193, 2, 'Dominican Republic', 10, 1 UNION ALL
	SELECT 311, 174, 1, 'RPA', 10, 1 UNION ALL
	SELECT 312, 174, 1, 'Republika Południowej Afryki', 7, 1 UNION ALL
	SELECT 313, 174, 1, 'Południowa Afryka', 4, 1 UNION ALL
	SELECT 314, 166, 1, 'Kenia', 10, 1 UNION ALL
	SELECT 315, 159, 1, 'Kamerun', 10, 1 UNION ALL
	SELECT 316, 159, 2, 'Cameroon', 10, 1 UNION ALL
	SELECT 317, 158, 1, 'Nigeria', 10, 1 UNION ALL
	SELECT 318, 158, 2, 'Nigeria', 10, 1 UNION ALL
	SELECT 319, 139, 1, 'Algieria', 10, 1 UNION ALL
	SELECT 320, 139, 2, 'Algeria', 10, 1 UNION ALL
	SELECT 321, 184, 1, 'Grenlandia', 10, 1 UNION ALL
	SELECT 322, 167, 1, 'Tanzania', 10, 1 UNION ALL
	SELECT 323, 152, 1, 'Somalia', 10, 0 UNION ALL
	SELECT 324, 149, 1, 'Gambia', 10, 1 UNION ALL
	SELECT 325, 132, 1, 'Australia', 10, 1 UNION ALL
	SELECT 326, 194, 1, 'Haiti', 10, 1 UNION ALL
	SELECT 327, 195, 1, 'Portoryko', 10, 1 UNION ALL
	SELECT 328, 195, 1, 'Puerto Rico', 5, 1 UNION ALL
	SELECT 329, 196, 1, 'Kostaryka', 10, 1 UNION ALL
	SELECT 330, 172, 1, 'Namibia', 10, 1 UNION ALL
	SELECT 331, 191, 1, 'Panama', 10, 1 UNION ALL
	SELECT 332, 190, 1, 'Nikaragua', 10, 1 UNION ALL
	SELECT 333, 175, 1, 'Zambia', 10, 1 UNION ALL
	SELECT 334, 177, 1, 'Botswana', 10, 1 UNION ALL
	SELECT 335, 103, 1, 'Bahrajn', 10, 1 UNION ALL
	SELECT 336, 104, 1, 'Katar', 10, 1 UNION ALL
	SELECT 337, 105, 1, 'Irak', 10, 1 UNION ALL
	SELECT 338, 106, 1, 'Iran', 10, 1 UNION ALL
	SELECT 339, 107, 1, 'Afganistan', 10, 1 UNION ALL
	SELECT 340, 109, 1, 'Pakistan', 10, 1 UNION ALL
	SELECT 341, 110, 1, 'Uzbekistan', 10, 1 UNION ALL
	SELECT 342, 111, 1, 'Turkmenistan', 10, 1 UNION ALL
	SELECT 343, 112, 1, 'Tadżykistan', 10, 1 UNION ALL
	SELECT 344, 113, 1, 'Kirgistan', 10, 1 UNION ALL
	SELECT 345, 114, 1, 'Nepal', 10, 1 UNION ALL
	SELECT 346, 118, 1, 'Mongolia', 10, 1 UNION ALL
	SELECT 347, 115, 1, 'Bhutan', 10, 1 UNION ALL
	SELECT 348, 116, 1, 'Bangladesz', 10, 1 UNION ALL
	SELECT 349, 117, 1, 'Sri Lanka', 10, 1 UNION ALL
	SELECT 350, 119, 1, 'Laos', 10, 1 UNION ALL
	SELECT 351, 120, 1, 'Kambodża', 10, 1 UNION ALL
	SELECT 352, 121, 1, 'Wietnam', 10, 1 UNION ALL
	SELECT 353, 122, 1, 'Myanmar', 10, 1 UNION ALL
	SELECT 354, 122, 1, 'Birma', 6, 1 UNION ALL
	SELECT 355, 123, 1, 'Korea Południowa', 10, 1 UNION ALL
	SELECT 356, 131, 1, 'Singapur', 10, 1 UNION ALL
	SELECT 357, 130, 1, 'Hongkong', 10, 1 UNION ALL
	SELECT 358, 129, 1, 'Tajwan', 10, 1 UNION ALL
	SELECT 359, 128, 1, 'Filipiny', 10, 1 UNION ALL
	SELECT 360, 126, 1, 'Indonezja', 10, 1 UNION ALL
	SELECT 361, 125, 1, 'Malezja', 10, 1 UNION ALL
	SELECT 362, 124, 1, 'Korea Północna', 10, 1 UNION ALL
	SELECT 363, 19, 2, 'Bosnia', 10, 1 UNION ALL
	SELECT 364, 31, 2, 'Ireland', 10, 1 UNION ALL
	SELECT 365, 54, 2, 'UK', 10, 1 UNION ALL
	SELECT 366, 55, 2, 'Vatican', 10, 1 UNION ALL
	SELECT 367, 103, 2, 'Bahrain', 10, 1 UNION ALL
	SELECT 368, 104, 2, 'Qatar', 10, 1 UNION ALL
	SELECT 369, 105, 2, 'Iraq', 10, 1 UNION ALL
	SELECT 370, 106, 2, 'Iran', 10, 1 UNION ALL
	SELECT 371, 107, 2, 'Afghanistan', 10, 1 UNION ALL
	SELECT 372, 109, 2, 'Pakistan', 10, 1 UNION ALL
	SELECT 373, 110, 2, 'Uzbekistan', 10, 1 UNION ALL
	SELECT 374, 111, 2, 'Turkmenistan', 10, 1 UNION ALL
	SELECT 375, 112, 2, 'Tajikistan', 10, 1 UNION ALL
	SELECT 376, 113, 2, 'Kyrgyzstan', 10, 1 UNION ALL
	SELECT 377, 114, 2, 'Nepal', 10, 1 UNION ALL
	SELECT 378, 115, 2, 'Bhutan', 10, 1 UNION ALL
	SELECT 379, 116, 2, 'Bangladesh', 10, 1 UNION ALL
	SELECT 380, 117, 2, 'Sri Lanka', 10, 1 UNION ALL
	SELECT 381, 118, 2, 'Mongolia', 10, 1 UNION ALL
	SELECT 382, 119, 2, 'Laos', 10, 1 UNION ALL
	SELECT 383, 120, 2, 'Cambodia', 10, 1 UNION ALL
	SELECT 384, 121, 2, 'Vietnam', 10, 1 UNION ALL
	SELECT 385, 122, 2, 'Myanmar', 10, 1 UNION ALL
	SELECT 386, 122, 2, 'Burma', 6, 1 UNION ALL
	SELECT 387, 123, 2, 'South Korea', 10, 1 UNION ALL
	SELECT 388, 124, 2, 'North Korea', 10, 1 UNION ALL
	SELECT 389, 125, 2, 'Malaysia', 10, 1 UNION ALL
	SELECT 390, 126, 2, 'Indonesia', 10, 1 UNION ALL
	SELECT 391, 128, 2, 'the Philippines', 10, 1 UNION ALL
	SELECT 392, 129, 2, 'Taiwan', 10, 1 UNION ALL
	SELECT 393, 130, 2, 'Hong Kong', 10, 1 UNION ALL
	SELECT 394, 131, 2, 'Singapore', 10, 1 UNION ALL
	SELECT 395, 132, 2, 'Australia', 10, 1 UNION ALL
	SELECT 396, 133, 2, 'New Zealand', 10, 1 UNION ALL
	SELECT 397, 133, 1, 'Nowa Zelandia', 10, 1 UNION ALL
	SELECT 398, 134, 1, 'Fidżi', 10, 1 UNION ALL
	SELECT 399, 134, 2, 'Fiji', 10, 1 UNION ALL
	SELECT 400, 198, 2, 'the Bahamas', 10, 1 UNION ALL
	SELECT 401, 197, 2, 'Belize', 10, 1 UNION ALL
	SELECT 402, 196, 2, 'Costa Rica', 10, 1 UNION ALL
	SELECT 403, 195, 2, 'Puerto Rico', 10, 1 UNION ALL
	SELECT 404, 194, 2, 'Haiti', 10, 1 UNION ALL
	SELECT 405, 183, 1, 'Meksyk', 10, 1 UNION ALL
	SELECT 406, 183, 2, 'Mexico', 10, 1 UNION ALL
	SELECT 407, 184, 2, 'Greenland', 10, 1 UNION ALL
	SELECT 408, 185, 1, 'Jamajka', 10, 1 UNION ALL
	SELECT 409, 185, 2, 'Jamaica', 10, 1 UNION ALL
	SELECT 410, 186, 1, 'Kuba', 10, 1 UNION ALL
	SELECT 411, 186, 2, 'Cuba', 10, 1 UNION ALL
	SELECT 412, 187, 1, 'Honduras', 10, 1 UNION ALL
	SELECT 413, 187, 2, 'Honduras', 10, 1 UNION ALL
	SELECT 414, 188, 1, 'Salwador', 10, 1 UNION ALL
	SELECT 415, 188, 2, 'El Salvador', 10, 1 UNION ALL
	SELECT 416, 189, 1, 'Gwatemala', 10, 1 UNION ALL
	SELECT 417, 189, 2, 'Guatemala', 10, 1 UNION ALL
	SELECT 418, 171, 1, 'Angola', 10, 1 UNION ALL
	SELECT 419, 171, 2, 'Angola', 10, 1 UNION ALL
	SELECT 420, 155, 1, 'Liberia', 10, 1 UNION ALL
	SELECT 421, 190, 2, 'Nicaragua', 10, 1 UNION ALL
	SELECT 422, 191, 2, 'Panama', 10, 1 UNION ALL
	SELECT 423, 170, 1, 'Madagaskar', 10, 1 UNION ALL
	SELECT 424, 170, 2, 'Madagascar', 10, 1 UNION ALL
	SELECT 425, 172, 2, 'Namibia', 10, 1 UNION ALL
	SELECT 426, 174, 2, 'South Africa', 10, 1 UNION ALL
	SELECT 427, 176, 1, 'Zimbabwe', 10, 1 UNION ALL
	SELECT 428, 176, 2, 'Zimbabwe', 10, 1 UNION ALL
	SELECT 429, 178, 1, 'Seszele', 10, 1 UNION ALL
	SELECT 430, 178, 2, 'Seychelles', 10, 1 UNION ALL
	SELECT 431, 180, 1, 'Mauritius', 10, 1 UNION ALL
	SELECT 432, 180, 2, 'Mauritius', 10, 1 UNION ALL
	SELECT 433, 181, 1, 'USA', 10, 1 UNION ALL
	SELECT 434, 181, 1, 'Stany Zjednoczone', 5, 1 UNION ALL
	SELECT 435, 181, 2, 'the USA', 10, 1 UNION ALL
	SELECT 436, 181, 2, 'the United States', 10, 1 UNION ALL
	SELECT 437, 175, 2, 'Zambia', 10, 1 UNION ALL
	SELECT 438, 177, 2, 'Botswana', 10, 1 UNION ALL
	SELECT 439, 166, 2, 'Kenya', 10, 1 UNION ALL
	SELECT 440, 167, 2, 'Tanzania', 10, 1 UNION ALL
	SELECT 441, 168, 1, 'Mozambik', 10, 1 UNION ALL
	SELECT 442, 168, 2, 'Mozambique', 10, 1 UNION ALL
	SELECT 443, 169, 1, 'Ruanda', 10, 1 UNION ALL
	SELECT 444, 169, 1, 'Rwanda', 10, 1 UNION ALL
	SELECT 445, 169, 2, 'Rwanda', 10, 1 UNION ALL
	SELECT 446, 165, 1, 'Burundi', 10, 1 UNION ALL
	SELECT 447, 165, 2, 'Burundi', 10, 1 UNION ALL
	SELECT 448, 164, 1, 'Uganda', 10, 1 UNION ALL
	SELECT 449, 164, 2, 'Uganda', 10, 1 UNION ALL
	SELECT 450, 162, 1, 'Kongo', 10, 1 UNION ALL
	SELECT 451, 162, 2, 'Congo', 10, 1 UNION ALL
	SELECT 452, 160, 1, 'Gabon', 10, 1 UNION ALL
	SELECT 453, 160, 2, 'Gabon', 10, 1 UNION ALL
	SELECT 454, 163, 1, 'Demokratyczna Republika Konga', 10, 1
COMMIT;
SET IDENTITY_INSERT [dbo].[Words] OFF

GO

-- Funkcja zwracająca język przypisany do danego wyrazu
CREATE FUNCTION [dbo].[checkWordLanguage] (@Word INT) 
RETURNS INT 
AS BEGIN
	DECLARE @Language INT

	SET @Language = (SELECT [w].[LanguageId] FROM [dbo].[Words] AS [w] WHERE [w].[Id] = @Word)

	RETURN @Language

END

GO




-- Właściwości wyrazów
CREATE TABLE [dbo].[WordsProperties] (
      [Id]			INT            IDENTITY (1, 1) NOT NULL
    , [WordId]		INT            NOT NULL
    , [PropertyId]	INT            NOT NULL
    , [ValueId]		INT			   NOT NULL
    , CONSTRAINT [PK_WordsProperties] PRIMARY KEY CLUSTERED ([Id] ASC)
	, CONSTRAINT [U_WordsProperties_WordProperty] UNIQUE NONCLUSTERED ([WordId] ASC, [PropertyId] ASC)
    , CONSTRAINT [FK_WordsProperties_Word] FOREIGN KEY ([WordId]) REFERENCES [dbo].[Words] ([Id])
    , CONSTRAINT [FK_WordsProperties_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
    , CONSTRAINT [FK_WordsProperties_Value] FOREIGN KEY ([ValueId]) REFERENCES [dbo].[GrammarPropertyOptions] ([Id])
    , CONSTRAINT [CH_WordsProperties_MatchProperty] CHECK ([dbo].[checkGrammarOptionProperty]([ValueId]) = [PropertyId])
    , CONSTRAINT [CH_WordsProperties_MatchLanguage] CHECK ([dbo].[checkWordLanguage]([WordId]) = [dbo].[checkGrammarDefinitionLanguage]([PropertyId]))
);


--!!! Dodać constraint, który sprawdza czy PropertyId.Language == WordId.Language

SET IDENTITY_INSERT [dbo].[WordsProperties] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[WordsProperties]([Id], [WordId], [PropertyId], [ValueId])
	SELECT 1, 1, 1, 2 UNION ALL
	SELECT 2, 1, 2, 4 UNION ALL
	SELECT 3, 1, 3, 14 UNION ALL
	SELECT 4, 1, 7, 15 UNION ALL
	SELECT 5, 3, 1, 1 UNION ALL
	SELECT 6, 3, 2, 6 UNION ALL
	SELECT 7, 3, 3, 14 UNION ALL
	SELECT 8, 3, 7, 16	
COMMIT;
SET IDENTITY_INSERT [dbo].[WordsProperties] OFF


GO


-- Odmiana gramatyczna wyrazu
CREATE TABLE [dbo].[GrammarForms] (
	  [Id]			INT				IDENTITY (1, 1) NOT NULL
	, [FormId]		INT				NOT NULL
    , [WordId]		INT				NOT NULL
    , [Content]		NVARCHAR (255)	NOT NULL
    , [IsActive]	BIT				DEFAULT ((1)) NOT NULL
    , [CreatorId]	INT				DEFAULT ((1)) NOT NULL
    , [CreateDate]	DATETIME		DEFAULT (GETDATE()) NOT NULL
    , [IsApproved]	BIT				DEFAULT ((0)) NOT NULL
    , [Positive]	INT				DEFAULT ((0)) NOT NULL
    , [Negative]	INT				DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_GrammarForms] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_GrammarForms_Form] FOREIGN KEY ([FormId]) REFERENCES [dbo].[GrammarFormsDefinitions] ([Id])
    , CONSTRAINT [FK_GrammarForms_Word] FOREIGN KEY ([WordId]) REFERENCES [dbo].[Words] ([Id])
    , CONSTRAINT [U_GrammarForms_WordForm] UNIQUE NONCLUSTERED ([WordId] ASC, [FormId] ASC)
);
GO



-- QUESTIONS

-- Metadefinicje

-- Tabela określająca które części mowy w poszczególnych językach mogą być połączone ze sobą na zasadzie zależności jednej od drugiej
-- np. przymiotnik zależny od rzeczownika w języku polskim - jeżeli rzeczownik jest rodzaju męskiego mówimy [ładny], a do rodzaju żeńskiego [ładna]
CREATE TABLE [dbo].[VariantDependenciesDefinitions]
(
      [Id]					INT		IDENTITY (1, 1) NOT NULL
    , [LanguageId]			INT		NOT NULL
	, [MasterWordtypeId]	INT		NOT NULL
	, [SlaveWordtypeId]		INT		NOT NULL
    , CONSTRAINT [PK_VariantDependenciesDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
	, CONSTRAINT [CH_DifferentWordtypes] CHECK ([MasterWordtypeId] <> [SlaveWordtypeId])
    , CONSTRAINT [U_VariantDependenciesDefinitions_Wordtypes] UNIQUE NONCLUSTERED ([MasterWordtypeId] ASC, [SlaveWordtypeId] ASC)
    , CONSTRAINT [FK_VariantDependenciesDefinitions_Languages] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
	, CONSTRAINT [FK_VariantDependenciesDefinitions_MasterWordtype] FOREIGN KEY ([MasterWordtypeId]) REFERENCES [dbo].[WordTypes] ([Id])
	, CONSTRAINT [FK_VariantDependenciesDefinitions_SlaveWordtype] FOREIGN KEY ([SlaveWordtypeId]) REFERENCES [dbo].[WordTypes] ([Id])
)
SET IDENTITY_INSERT [dbo].[VariantDependenciesDefinitions] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[VariantDependenciesDefinitions] ([Id], [LanguageId], [MasterWordtypeId], [SlaveWordtypeId]) 
	SELECT 1, 1, 1, 2 UNION ALL		-- czasownik <- rzeczownik
	SELECT 2, 1, 1, 3 UNION ALL		-- przymiotnik <- rzeczownik
	SELECT 3, 1, 5, 2				-- czasownik <- zaimek
COMMIT;
SET IDENTITY_INSERT [dbo].[VariantDependenciesDefinitions] OFF





GO


-- Tabela określająca właściwości wymagane do opisania poszczególnych wariant setów (w zależności od ich wordtype).
CREATE TABLE [dbo].[VariantSetRequiredProperties] (
      [Id]              INT		IDENTITY (1, 1) NOT NULL
    , [LanguageId]      INT		NOT NULL
    , [WordtypeId]		INT		NOT NULL
    , [PropertyId]		INT		NOT NULL
    , CONSTRAINT [PK_VariantSetRequiredProperties] PRIMARY KEY CLUSTERED ([Id] ASC) 
    , CONSTRAINT [UQ_VariantSetRequiredProperties_UniqueSet] UNIQUE NONCLUSTERED([LanguageId], [WordtypeId], [PropertyId])
    , CONSTRAINT [FK_VariantSetRequiredProperties_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_VariantSetRequiredProperties_Wordtype] FOREIGN KEY ([WordtypeId]) REFERENCES [dbo].[WordTypes] ([Id])
    , CONSTRAINT [FK_VariantSetRequiredProperties_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[GrammarPropertyDefinitions] ([Id])
);
SET IDENTITY_INSERT [dbo].[VariantSetRequiredProperties] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[VariantSetRequiredProperties] ([Id], [LanguageId], [WordtypeId], [PropertyId]) 
	SELECT 1, 1, 1, 2 UNION ALL		-- rzeczownik:liczba
	SELECT 2, 1, 1, 9				-- rzeczownik:przypadek
COMMIT;
SET IDENTITY_INSERT [dbo].[VariantSetRequiredProperties] OFF


GO



-- Pytania
CREATE TABLE [dbo].[Questions] (
      [Id]				INT           IDENTITY (1, 1) NOT NULL
    , [Name]			VARCHAR (255) NOT NULL UNIQUE
    , [Weight]			INT           DEFAULT ((0)) NOT NULL
    , [IsActive]		BIT           DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT           DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME      DEFAULT (GETDATE()) NOT NULL
    , [IsApproved]		BIT           DEFAULT ((0)) NOT NULL
    , [Positive]		INT           DEFAULT ((0)) NOT NULL
    , [Negative]		INT           DEFAULT ((0)) NOT NULL
    , [IsComplex]		BIT           DEFAULT ((1)) NOT NULL
    , CONSTRAINT [PK_Questions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_Questions_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [Check_Weight] CHECK ([Weight] > (0) AND [Weight] <= (10))
);
GO


-- Maczowanie pytań z kategoriami
CREATE TABLE [dbo].[MatchQuestionCategory] (
      [Id]				INT			IDENTITY (1, 1) NOT NULL
    , [QuestionId]		INT			NOT NULL
    , [CategoryId]		INT			NOT NULL
    , [IsActive]		BIT			DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT			DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME	DEFAULT (GETDATE()) NOT NULL
    , [IsApproved]		BIT			DEFAULT ((0)) NOT NULL
    , [Positive]		INT			DEFAULT ((0)) NOT NULL
    , [Negative]		INT			DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_MatchQuestionCategory] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_MatchQuestionCategory_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
    , CONSTRAINT [FK_MatchQuestionCategory_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id])
    , CONSTRAINT [FK_MatchQuestionCategory_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
);
GO


-- Opcje zapytań
CREATE TABLE [dbo].[QuestionsOptions] (
      [Id]				INT            IDENTITY (1, 1) NOT NULL
    , [QuestionId]		INT            NOT NULL
    , [LanguageId]		INT            NOT NULL
    , [Content]			NVARCHAR (255) NOT NULL
    , [Weight]			INT            DEFAULT ((1)) NOT NULL
    , [IsActive]		BIT            DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT            DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME       DEFAULT (GETDATE()) NOT NULL
    , [IsApproved]		BIT            DEFAULT ((0)) NOT NULL
    , [Positive]		INT            DEFAULT ((0)) NOT NULL
    , [Negative]		INT            DEFAULT ((0)) NOT NULL
    , [IsComplex]		BIT            DEFAULT ((0)) NOT NULL
	, [IsCompleted]		BIT			   DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_QuestionsOptions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_QuestionsOptions_QuestionLanguageContent] UNIQUE NONCLUSTERED ([QuestionId] ASC, [LanguageId] ASC, [Content] ASC)
    , CONSTRAINT [FK_QuestionsOptions_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
    , CONSTRAINT [FK_QuestionsOptions_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [FK_QuestionsOptions_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [CH_QuestionsOptionsWeight] CHECK ([Weight] > (0) AND [Weight] <= (10))
);

GO



-- Warianty dla zapytań.
CREATE TABLE [dbo].[VariantSets] (
      [Id]				INT            IDENTITY (1, 1) NOT NULL
    , [QuestionId]		INT            NOT NULL
    , [LanguageId]		INT            NOT NULL
    , [VariantTag]		NVARCHAR (255) NOT NULL
    , [WordType]		INT            NOT NULL
    --, [Params]			NVARCHAR (255) NOT NULL
    , [IsActive]		BIT            DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT            DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME       DEFAULT (GETDATE()) NOT NULL
    , CONSTRAINT [PK_VariantSets] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_VariantSets_QuestionLanguageTag] UNIQUE NONCLUSTERED ([QuestionId] ASC, [LanguageId] ASC, [VariantTag] ASC)
    , CONSTRAINT [FK_VariantSets_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
    , CONSTRAINT [FK_VariantSets_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
    , CONSTRAINT [FK_VariantSets_Wordtype] FOREIGN KEY ([WordType]) REFERENCES [dbo].[WordTypes] ([Id])
    , CONSTRAINT [FK_VariantSets_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
);

GO



-- Funkcja sprawdzająca poprawność matchowania Language-GrammarPropertyDefinition
CREATE FUNCTION [dbo].[checkQuestionForVariantSet] (@VariantSet INT) 
RETURNS INT 
AS BEGIN

	DECLARE @Question INT

	SET @Question = (SELECT [vs].[QuestionId] FROM [dbo].[VariantSets] AS [vs] WHERE [vs].[Id] = @VariantSet)

	RETURN @Question

END

GO



-- Właściwości poszczególnych wariant setów.
CREATE TABLE [dbo].[VariantSetProperties] (
      [Id]				INT			IDENTITY (1, 1) NOT NULL
	, [VariantSetId]	INT			NOT NULL
	, [PropertyId]		INT			NOT NULL
	, [Value]			INT			NOT NULL
    , CONSTRAINT [PK_VariantSetProperties] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [FK_VariantSetProperties_VariantSet] FOREIGN KEY ([VariantSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [FK_VariantSetProperties_Property] FOREIGN KEY ([PropertyId]) REFERENCES [dbo].[VariantSetRequiredProperties] ([Id])
);

GO



-- Tabela przechowująca Varianty znajdujące się w VariantSetach
CREATE TABLE [dbo].[Variants] (
      [Id]				INT				IDENTITY (1, 1) NOT NULL
    , [VariantSetId]	INT				NOT NULL
    , [Key]				NVARCHAR (255)	NOT NULL
    , [Content]			NVARCHAR (255)	NOT NULL
    , [WordId]			INT				NULL
    , [IsAnchored]		BIT				DEFAULT ((0)) NOT NULL
    , [IsActive]		BIT				DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT				DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME		DEFAULT (GETDATE()) NOT NULL
    , [IsApproved]		BIT				DEFAULT ((0)) NOT NULL
    , [Positive]		INT				DEFAULT ((0)) NOT NULL
    , [Negative]		INT				DEFAULT ((0)) NOT NULL
    , CONSTRAINT [PK_Variants] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_Variants_SetKey] UNIQUE NONCLUSTERED ([VariantSetId] ASC, [Key] ASC)
    , CONSTRAINT [FK_Variants_Words] FOREIGN KEY ([WordId]) REFERENCES [dbo].[Words] ([Id])
    , CONSTRAINT [FK_Variants_Set] FOREIGN KEY ([VariantSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [FK_Variants_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
);

GO



CREATE FUNCTION [dbo].[checkSetForVariant] (@Variant INT) 
RETURNS INT 
AS BEGIN

	DECLARE @VariantSet INT

	SET @VariantSet = (SELECT [v].[VariantSetId] FROM [dbo].[Variants] AS [v] WHERE [v].[Id] = @Variant)

	RETURN @VariantSet

END

GO



-- Tabela określająca, które wariant sety są ze sobą powiązane.
CREATE TABLE [dbo].[VariantConnections] (
      [Id]				INT			IDENTITY (1, 1) NOT NULL
    , [VariantSetId]	INT			NOT NULL
    , [ConnectedSetId]	INT			NOT NULL
    , [IsActive]		BIT			DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT			DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME	DEFAULT (GETDATE()) NOT NULL
    , CONSTRAINT [PK_VariantConnections] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_VariantConnections_DifferentSets] UNIQUE NONCLUSTERED ([VariantSetId] ASC, [ConnectedSetId] ASC)
    , CONSTRAINT [FK_VariantConnections_VariantSet] FOREIGN KEY ([VariantSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [FK_VariantConnections_ConnectedSet] FOREIGN KEY ([ConnectedSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [FK_VariantConnections_Creator] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [CH_VariantConnections_DifferentVariants] CHECK ([VariantSetId] <> [ConnectedSetId])
    , CONSTRAINT [CH_VariantConnections_VariantsOfTheSameQuestion] CHECK ([dbo].[checkQuestionForVariantSet]([VariantSetId]) = [dbo].[checkQuestionForVariantSet]([ConnectedSetId]))
);

GO


-- Tabela przechowująca listę wariantów uzależnionych od siebie
CREATE TABLE [dbo].[VariantDependencies] (
      [Id]				INT			IDENTITY (1, 1) NOT NULL
    , [MainSetId]		INT			NOT NULL
    , [DependantSetId]	INT			NOT NULL
    , [IsActive]		BIT			DEFAULT ((1)) NOT NULL
    , [CreatorId]		INT			DEFAULT ((1)) NOT NULL
    , [CreateDate]		DATETIME	DEFAULT (GETDATE()) NOT NULL
    , CONSTRAINT [PK_VariantDependencies] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_VariantDependencies_UniqueSets] UNIQUE NONCLUSTERED ([MainSetId] ASC, [DependantSetId] ASC)
    , CONSTRAINT [FK_VariantDependencies_MainSet] FOREIGN KEY ([MainSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [FK_VariantDependencies_DependantSet] FOREIGN KEY ([DependantSetId]) REFERENCES [dbo].[VariantSets] ([Id])
    , CONSTRAINT [CH_VariantDependencies_DifferentVariants] CHECK ([MainSetId] <> [DependantSetId])
    , CONSTRAINT [CH_VariantDependencies_VariantsOfTheSameQuestion] CHECK ([dbo].[checkQuestionForVariantSet]([MainSetId]) = [dbo].[checkQuestionForVariantSet]([DependantSetId]))
);

GO


-- Tabela przechowująca listę wykluczających się wariantów
CREATE TABLE [dbo].[VariantLimits] (
      [Id]					INT     IDENTITY (1, 1) NOT NULL
    , [QuestionId]			INT		NOT NULL
    , [VariantId]			INT     NOT NULL
    , [ConnectedVariantId]	INT     NOT NULL
    , [IsActive]			BIT     DEFAULT ((1)) NOT NULL
    , [CreatorId]			INT     DEFAULT ((1)) NOT NULL
    , [CreateDate]			DATETIME DEFAULT (GETDATE()) NOT NULL
    , CONSTRAINT [PK_VariantLimits] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_VariantLimits_UniqueVariants] UNIQUE NONCLUSTERED ([VariantId] ASC, [ConnectedVariantId] ASC)
    , CONSTRAINT [FK_VariantLimits_Variant] FOREIGN KEY ([VariantId]) REFERENCES [dbo].[Variants] ([Id])
    , CONSTRAINT [FK_VariantLimits_ConnectedVariant] FOREIGN KEY ([ConnectedVariantId]) REFERENCES [dbo].[Variants] ([Id])
    , CONSTRAINT [CH_VariantLimits_DifferentVariants] CHECK ([VariantId] <> [ConnectedVariantId])
    , CONSTRAINT [CH_VariantLimits_VariantsOfDifferentSets] CHECK ([dbo].[checkSetForVariant]([VariantId]) <> [dbo].[checkSetForVariant]([ConnectedVariantId]))
);