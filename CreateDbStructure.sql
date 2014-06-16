USE [test];
--GO

-- Czyszczenie bazy --

-- Usuwanie tabel
IF OBJECT_ID('dbo.LearningExcludedQuestions', N'U') IS NOT NULL DROP TABLE [dbo].[LearningExcludedQuestions]
IF OBJECT_ID('dbo.LearningExcludedWords', N'U') IS NOT NULL DROP TABLE [dbo].[LearningExcludedWords]

IF OBJECT_ID('dbo.VariantLimits', N'U') IS NOT NULL DROP TABLE [dbo].[VariantLimits]
IF OBJECT_ID('dbo.VariantDependencies', N'U') IS NOT NULL DROP TABLE [dbo].[VariantDependencies]
IF OBJECT_ID('dbo.VariantConnections', N'U') IS NOT NULL DROP TABLE [dbo].[VariantConnections]
IF OBJECT_ID('dbo.VariantSetProperties', N'U') IS NOT NULL DROP TABLE [dbo].[VariantSetProperties]
IF OBJECT_ID('dbo.Variants', N'U') IS NOT NULL DROP TABLE [dbo].[Variants]
IF OBJECT_ID('dbo.VariantSets', N'U') IS NOT NULL DROP TABLE [dbo].[VariantSets]

IF OBJECT_ID('dbo.QuestionsOptions', N'U') IS NOT NULL DROP TABLE [dbo].[QuestionsOptions]
IF OBJECT_ID('dbo.MatchQuestionCategory', N'U') IS NOT NULL DROP TABLE [dbo].[MatchQuestionCategory]
IF OBJECT_ID('dbo.Questions', N'U') IS NOT NULL DROP TABLE [dbo].[Questions]
IF OBJECT_ID('dbo.VariantSetRequiredProperties', N'U') IS NOT NULL DROP TABLE [dbo].[VariantSetRequiredProperties]
IF OBJECT_ID('dbo.VariantDependenciesDefinitions', N'U') IS NOT NULL DROP TABLE [dbo].[VariantDependenciesDefinitions]

IF OBJECT_ID('dbo.GrammarForms', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarForms]
IF OBJECT_ID('dbo.WordsProperties', N'U') IS NOT NULL DROP TABLE [dbo].[WordsProperties]
IF OBJECT_ID('dbo.Words', N'U') IS NOT NULL DROP TABLE [dbo].[Words]
IF OBJECT_ID('dbo.MatchWordCategory', N'U') IS NOT NULL DROP TABLE [dbo].[MatchWordCategory]
IF OBJECT_ID('dbo.Metawords', N'U') IS NOT NULL DROP TABLE [dbo].[Metawords]

IF OBJECT_ID('dbo.WordRequiredProperties', N'U') IS NOT NULL DROP TABLE [dbo].[WordRequiredProperties]
IF OBJECT_ID('dbo.GrammarFormsInactiveRules', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsInactiveRules]
IF OBJECT_ID('dbo.GrammarFormsDefinitionsProperties', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsDefinitionsProperties]
IF OBJECT_ID('dbo.GrammarFormsDefinitions', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsDefinitions]
IF OBJECT_ID('dbo.GrammarFormsGroups', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarFormsGroups]

IF OBJECT_ID('dbo.GrammarPropertyOptions', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarPropertyOptions]
IF OBJECT_ID('dbo.GrammarPropertyDefinitions', N'U') IS NOT NULL DROP TABLE [dbo].[GrammarPropertyDefinitions]
IF OBJECT_ID('dbo.ValueTypes', N'U') IS NOT NULL DROP TABLE [dbo].[ValueTypes]
IF OBJECT_ID('dbo.WordTypes', N'U') IS NOT NULL DROP TABLE [dbo].[WordTypes]

IF OBJECT_ID('dbo.Categories', N'U') IS NOT NULL DROP TABLE [dbo].[Categories]
IF OBJECT_ID('dbo.UsersLanguages', N'U') IS NOT NULL DROP TABLE [dbo].[UsersLanguages]
IF OBJECT_ID('dbo.Users', N'U') IS NOT NULL DROP TABLE [dbo].[Users]
IF OBJECT_ID('dbo.Languages', N'U') IS NOT NULL DROP TABLE [dbo].[Languages]
IF OBJECT_ID('dbo.Countries', N'U') IS NOT NULL DROP TABLE [dbo].[Countries]


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
    , [Flag]			NVARCHAR (2)	NULL
    , [IsActive]		BIT				DEFAULT ((1)) NOT NULL
    , [OriginalName]	NVARCHAR (255)	NULL
    , CONSTRAINT [PK_Languages] PRIMARY KEY CLUSTERED ([Id] ASC)
);

SET IDENTITY_INSERT [dbo].[Languages] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[Languages] ([Id], [Name], [Flag], [IsActive], [OriginalName])
	SELECT 1, N'polski', N'pl', 1, N'Polski' UNION ALL
	SELECT 2, N'angielski', N'uk', 1, N'English' UNION ALL
	SELECT 3, N'hiszpański', N'es', 1, N'Español' UNION ALL
	SELECT 4, N'włoski', N'it', 1, N'Italiano'
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
	SELECT 1, 1, 1, N'Header', 1, 0 UNION ALL
	SELECT 2, 1, 1, N'Liczba pojedyncza', 0, 1 UNION ALL
	SELECT 3, 1, 1, N'Liczba mnoga', 0, 2 UNION ALL
	SELECT 4, 2, 1, N'Header', 1, 0 UNION ALL
	SELECT 5, 2, 1, N'Forms', 0, 1
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
	SELECT 1, 1, N'To jest ...', 0 UNION ALL
	SELECT 2, 1, N'Nie ma ...', 1 UNION ALL
	SELECT 3, 1, N'Przyglądam się ...', 2 UNION ALL
	SELECT 4, 1, N'Widzę ...', 3 UNION ALL
	SELECT 5, 1, N'Porozmawiaj z ...', 4 UNION ALL
	SELECT 6, 1, N'Porozmawiaj o ...', 5 UNION ALL
	SELECT 7, 1, N'!...', 6 UNION ALL
	SELECT 8, 2, N'Mianownik pojedynczy', 0 UNION ALL
	SELECT 9, 2, N'Dopełniacz pojedynczy', 1 UNION ALL
	SELECT 10, 2, N'Celownik pojedynczy', 2 UNION ALL
	SELECT 11, 2, N'Biernik pojedynczy', 3 UNION ALL
	SELECT 12, 2, N'Narzędnik pojedynczy', 4 UNION ALL
	SELECT 13, 2, N'Miejscownik pojedynczy', 5 UNION ALL
	SELECT 14, 2, N'Wołacz pojedynczy', 6 UNION ALL
	SELECT 15, 3, N'Mianownik mnogi', 0 UNION ALL
	SELECT 16, 3, N'Dopełniacz mnogi', 1 UNION ALL
	SELECT 17, 3, N'Celownik mnogi', 2 UNION ALL
	SELECT 18, 3, N'Biernik mnogi', 3 UNION ALL
	SELECT 19, 3, N'Narzędnik mnogi', 4 UNION ALL
	SELECT 20, 3, N'Miejscownik mnogi', 5 UNION ALL
	SELECT 21, 3, N'Wołacz mnogi', 6 UNION ALL
	SELECT 22, 1, N'Jadę ...', 7 UNION ALL
	SELECT 23, 1, N'Jestem ...', 8 UNION ALL
	SELECT 24, 2, N'Do', 7 UNION ALL
	SELECT 25, 2, N'W', 8 UNION ALL
	SELECT 27, 4, N'article', 0 UNION ALL
	SELECT 28, 4, N'singular', 1 UNION ALL
	SELECT 29, 4, N'plural', 2 UNION ALL
	SELECT 30, 4, N'to ...', 3 UNION ALL
	SELECT 31, 4, N'in ...', 4 UNION ALL
	SELECT 32, 5, N'article', 0 UNION ALL
	SELECT 33, 5, N'singular', 1 UNION ALL
	SELECT 34, 5, N'plural', 2 UNION ALL
	SELECT 35, 5, N'to ...', 3 UNION ALL
	SELECT 36, 5, N'in ...', 4
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
	SELECT 1, 1, 1, N'Polska', 10, 1 UNION ALL
	SELECT 2, 1, 2, N'Poland', 10, 1 UNION ALL
	SELECT 3, 2, 1, N'pies', 10, 1 UNION ALL
	SELECT 4, 1, 3, N'Polonia', 10, 0 UNION ALL
	SELECT 5, 1, 4, N'Polonia', 10, 0 UNION ALL
	SELECT 6, 2, 2, N'dog', 10, 1 UNION ALL
	SELECT 7, 2, 3, N'perro', 10, 0 UNION ALL
	SELECT 8, 2, 4, N'cane', 10, 0 UNION ALL
	SELECT 11, 4, 1, N'Włochy', 10, 1 UNION ALL
	SELECT 12, 4, 2, N'Italy', 10, 1 UNION ALL
	SELECT 13, 4, 3, N'Italia', 10, 0 UNION ALL
	SELECT 14, 4, 4, N'Italia', 10, 0 UNION ALL
	SELECT 15, 5, 1, N'Hiszpania', 10, 1 UNION ALL
	SELECT 16, 5, 2, N'Spain', 10, 1 UNION ALL
	SELECT 17, 5, 3, N'España', 10, 0 UNION ALL
	SELECT 18, 5, 4, N'Spagna', 10, 0 UNION ALL
	SELECT 19, 6, 1, N'Francja', 10, 1 UNION ALL
	SELECT 20, 6, 2, N'France', 10, 1 UNION ALL
	SELECT 21, 6, 3, N'Francia', 10, 0 UNION ALL
	SELECT 22, 6, 4, N'Francia', 10, 0 UNION ALL
	SELECT 23, 9, 1, N'Niemcy', 10, 1 UNION ALL
	SELECT 24, 9, 2, N'Germany', 10, 1 UNION ALL
	SELECT 25, 9, 3, N'Alemania', 10, 0 UNION ALL
	SELECT 26, 9, 4, N'Germania', 10, 0 UNION ALL
	SELECT 27, 10, 1, N'Anglia', 10, 1 UNION ALL
	SELECT 28, 10, 2, N'England', 10, 1 UNION ALL
	SELECT 29, 10, 3, N'Inglaterra', 10, 0 UNION ALL
	SELECT 30, 10, 4, N'Inghilterra', 10, 0 UNION ALL
	SELECT 31, 11, 1, N'Rosja', 10, 1 UNION ALL
	SELECT 32, 11, 2, N'Russia', 10, 1 UNION ALL
	SELECT 33, 11, 3, N'Rusia', 10, 0 UNION ALL
	SELECT 34, 11, 4, N'Russia', 10, 0 UNION ALL
	SELECT 35, 12, 1, N'Albania', 10, 1 UNION ALL
	SELECT 36, 12, 2, N'Albania', 10, 1 UNION ALL
	SELECT 37, 12, 3, N'Albania', 10, 0 UNION ALL
	SELECT 38, 12, 4, N'Albania', 10, 0 UNION ALL
	SELECT 40, 13, 1, N'Andora', 10, 1 UNION ALL
	SELECT 41, 14, 1, N'Armenia', 10, 1 UNION ALL
	SELECT 42, 15, 1, N'Austria', 10, 1 UNION ALL
	SELECT 43, 16, 1, N'Azerbejdżan', 10, 1 UNION ALL
	SELECT 44, 17, 1, N'Białoruś', 10, 1 UNION ALL
	SELECT 45, 18, 1, N'Belgia', 10, 1 UNION ALL
	SELECT 46, 19, 1, N'Bośnia i Hercegowina', 10, 1 UNION ALL
	SELECT 47, 20, 1, N'Bułgaria', 10, 1 UNION ALL
	SELECT 48, 21, 1, N'Chorwacja', 10, 1 UNION ALL
	SELECT 49, 22, 1, N'Cypr', 10, 1 UNION ALL
	SELECT 50, 23, 1, N'Czechy', 10, 1 UNION ALL
	SELECT 51, 24, 1, N'Dania', 10, 1 UNION ALL
	SELECT 52, 25, 1, N'Estonia', 10, 1 UNION ALL
	SELECT 53, 26, 1, N'Finlandia', 10, 1 UNION ALL
	SELECT 54, 27, 1, N'Gruzja', 10, 1 UNION ALL
	SELECT 55, 28, 1, N'Grecja', 10, 1 UNION ALL
	SELECT 56, 29, 1, N'Węgry', 10, 1 UNION ALL
	SELECT 57, 30, 1, N'Islandia', 10, 1 UNION ALL
	SELECT 58, 31, 1, N'Irlandia', 10, 1 UNION ALL
	SELECT 59, 32, 1, N'Kazachstan', 10, 1 UNION ALL
	SELECT 60, 33, 1, N'Łotwa', 10, 1 UNION ALL
	SELECT 61, 34, 1, N'Liechtenstein', 10, 1 UNION ALL
	SELECT 62, 35, 1, N'Litwa', 10, 1 UNION ALL
	SELECT 63, 36, 1, N'Luksemburg', 10, 1 UNION ALL
	SELECT 64, 37, 1, N'Macedonia', 10, 1 UNION ALL
	SELECT 65, 38, 1, N'Malta', 10, 1 UNION ALL
	SELECT 66, 39, 1, N'Mołdawia', 10, 1 UNION ALL
	SELECT 67, 40, 1, N'Monako', 10, 1 UNION ALL
	SELECT 68, 41, 1, N'Czarnogóra', 10, 1 UNION ALL
	SELECT 69, 42, 1, N'Holandia', 10, 1 UNION ALL
	SELECT 70, 43, 1, N'Norwegia', 10, 1 UNION ALL
	SELECT 71, 44, 1, N'Portugalia', 10, 1 UNION ALL
	SELECT 72, 45, 1, N'Rumunia', 10, 1 UNION ALL
	SELECT 73, 46, 1, N'San Marino', 10, 1 UNION ALL
	SELECT 74, 47, 1, N'Serbia', 10, 1 UNION ALL
	SELECT 75, 48, 1, N'Słowacja', 10, 1 UNION ALL
	SELECT 76, 49, 1, N'Słowenia', 10, 1 UNION ALL
	SELECT 77, 50, 1, N'Szwecja', 10, 1 UNION ALL
	SELECT 78, 51, 1, N'Szwajcaria', 10, 1 UNION ALL
	SELECT 79, 52, 1, N'Turcja', 10, 1 UNION ALL
	SELECT 80, 53, 1, N'Ukraina', 10, 1 UNION ALL
	SELECT 81, 54, 1, N'Wielka Brytania', 10, 1 UNION ALL
	SELECT 82, 55, 1, N'Watykan', 10, 1 UNION ALL
	SELECT 83, 56, 1, N'Szkocja', 10, 1 UNION ALL
	SELECT 85, 13, 2, N'Andorra', 10, 1 UNION ALL
	SELECT 86, 14, 2, N'Armenia', 10, 1 UNION ALL
	SELECT 87, 15, 2, N'Austria', 10, 1 UNION ALL
	SELECT 88, 16, 2, N'Azerbaijan', 10, 1 UNION ALL
	SELECT 89, 17, 2, N'Belarus', 10, 1 UNION ALL
	SELECT 90, 18, 2, N'Belgium', 10, 1 UNION ALL
	SELECT 91, 19, 2, N'Bosnia and Herzegovina', 10, 1 UNION ALL
	SELECT 92, 20, 2, N'Bulgaria', 10, 1 UNION ALL
	SELECT 93, 21, 2, N'Croatia', 10, 1 UNION ALL
	SELECT 94, 22, 2, N'Cyprus', 10, 1 UNION ALL
	SELECT 95, 23, 2, N'Czech Republic', 10, 1 UNION ALL
	SELECT 96, 24, 2, N'Denmark', 10, 1 UNION ALL
	SELECT 97, 25, 2, N'Estonia', 10, 1 UNION ALL
	SELECT 98, 26, 2, N'Finland', 10, 1 UNION ALL
	SELECT 99, 27, 2, N'Georgia', 10, 1 UNION ALL
	SELECT 100, 28, 2, N'Greece', 10, 1 UNION ALL
	SELECT 101, 29, 2, N'Hungary', 10, 1 UNION ALL
	SELECT 102, 30, 2, N'Iceland', 10, 1 UNION ALL
	SELECT 103, 31, 2, N'Republic of Ireland', 5, 1 UNION ALL
	SELECT 104, 32, 2, N'Kazakhstan', 10, 1 UNION ALL
	SELECT 105, 33, 2, N'Latvia', 10, 1 UNION ALL
	SELECT 106, 34, 2, N'Liechtenstein', 10, 1 UNION ALL
	SELECT 107, 35, 2, N'Lithuania', 10, 1 UNION ALL
	SELECT 108, 36, 2, N'Luxembourg', 10, 1 UNION ALL
	SELECT 109, 37, 2, N'Macedonia', 10, 1 UNION ALL
	SELECT 110, 38, 2, N'Malta', 10, 1 UNION ALL
	SELECT 111, 39, 2, N'Moldova', 10, 1 UNION ALL
	SELECT 112, 40, 2, N'Monaco', 10, 1 UNION ALL
	SELECT 113, 41, 2, N'Montenegro', 10, 1 UNION ALL
	SELECT 114, 42, 2, N'the Netherlands', 10, 1 UNION ALL
	SELECT 115, 43, 2, N'Norway', 10, 1 UNION ALL
	SELECT 116, 44, 2, N'Portugal', 10, 1 UNION ALL
	SELECT 117, 45, 2, N'Romania', 10, 1 UNION ALL
	SELECT 118, 46, 2, N'San Marino', 10, 1 UNION ALL
	SELECT 119, 47, 2, N'Serbia', 10, 1 UNION ALL
	SELECT 120, 48, 2, N'Slovakia', 10, 1 UNION ALL
	SELECT 121, 49, 2, N'Slovenia', 10, 1 UNION ALL
	SELECT 122, 50, 2, N'Sweden', 10, 1 UNION ALL
	SELECT 123, 51, 2, N'Switzerland', 10, 1 UNION ALL
	SELECT 124, 52, 2, N'Turkey', 10, 1 UNION ALL
	SELECT 125, 53, 2, N'Ukraine', 10, 1 UNION ALL
	SELECT 126, 54, 2, N'United Kingdom', 10, 1 UNION ALL
	SELECT 127, 55, 2, N'Vatican City', 5, 1 UNION ALL
	SELECT 128, 56, 2, N'Scotland', 10, 1 UNION ALL
	SELECT 130, 13, 3, N'Andorra', 10, 0 UNION ALL
	SELECT 131, 14, 3, N'Armenia', 10, 0 UNION ALL
	SELECT 132, 15, 3, N'Austria', 10, 0 UNION ALL
	SELECT 133, 16, 3, N'Azerbaiyán', 10, 0 UNION ALL
	SELECT 134, 17, 3, N'Bielorrusia', 10, 0 UNION ALL
	SELECT 135, 18, 3, N'Bélgica', 10, 0 UNION ALL
	SELECT 136, 19, 3, N'Bosnia-Herzegovina', 10, 0 UNION ALL
	SELECT 137, 20, 3, N'Bulgaria', 10, 0 UNION ALL
	SELECT 138, 21, 3, N'Croacia', 10, 0 UNION ALL
	SELECT 139, 22, 3, N'Chipre', 10, 0 UNION ALL
	SELECT 140, 23, 3, N'República Checa', 10, 0 UNION ALL
	SELECT 141, 24, 3, N'Dinamarca', 10, 0 UNION ALL
	SELECT 142, 25, 3, N'Estonia', 10, 0 UNION ALL
	SELECT 143, 26, 3, N'Finlandia', 10, 0 UNION ALL
	SELECT 144, 27, 3, N'Georgia', 10, 0 UNION ALL
	SELECT 145, 28, 3, N'Grecia', 10, 0 UNION ALL
	SELECT 146, 29, 3, N'Hungría', 10, 0 UNION ALL
	SELECT 147, 30, 3, N'Islandia', 10, 0 UNION ALL
	SELECT 148, 31, 3, N'Irlanda', 10, 0 UNION ALL
	SELECT 149, 32, 3, N'Kazajistán', 10, 0 UNION ALL
	SELECT 150, 33, 3, N'Letonia', 10, 0 UNION ALL
	SELECT 151, 34, 3, N'Liechtenstein', 10, 0 UNION ALL
	SELECT 152, 35, 3, N'Lituania', 10, 0 UNION ALL
	SELECT 153, 36, 3, N'Luxemburgo', 10, 0 UNION ALL
	SELECT 154, 37, 3, N'Macedonia', 10, 0 UNION ALL
	SELECT 155, 38, 3, N'Malta', 10, 0 UNION ALL
	SELECT 156, 39, 3, N'Moldavia', 10, 0 UNION ALL
	SELECT 157, 40, 3, N'Mónaco', 10, 0 UNION ALL
	SELECT 158, 41, 3, N'Montenegro', 10, 0 UNION ALL
	SELECT 159, 42, 3, N'Países Bajos', 10, 0 UNION ALL
	SELECT 160, 43, 3, N'Noruega', 10, 0 UNION ALL
	SELECT 161, 44, 3, N'Portugal', 10, 0 UNION ALL
	SELECT 162, 45, 3, N'Rumania', 10, 0 UNION ALL
	SELECT 163, 46, 3, N'San Marino', 10, 0 UNION ALL
	SELECT 164, 47, 3, N'Serbia', 10, 0 UNION ALL
	SELECT 165, 48, 3, N'Eslovaquia', 10, 0 UNION ALL
	SELECT 166, 49, 3, N'Eslovenia', 10, 0 UNION ALL
	SELECT 167, 50, 3, N'Suecia', 10, 0 UNION ALL
	SELECT 168, 51, 3, N'Suiza', 10, 0 UNION ALL
	SELECT 169, 52, 3, N'Turquía', 10, 0 UNION ALL
	SELECT 170, 53, 3, N'Ucrania', 10, 0 UNION ALL
	SELECT 171, 54, 3, N'Reino Unido', 10, 0 UNION ALL
	SELECT 172, 55, 3, N'Ciudad del Vaticano', 10, 0 UNION ALL
	SELECT 173, 56, 3, N'Escocia', 10, 0 UNION ALL
	SELECT 175, 13, 4, N'Andorra', 10, 0 UNION ALL
	SELECT 176, 14, 4, N'Armenia', 10, 0 UNION ALL
	SELECT 177, 15, 4, N'Austria', 10, 0 UNION ALL
	SELECT 178, 16, 4, N'Azerbaigian', 10, 0 UNION ALL
	SELECT 179, 17, 4, N'Bielorussia', 10, 0 UNION ALL
	SELECT 180, 18, 4, N'Belgio', 10, 0 UNION ALL
	SELECT 181, 19, 4, N'Bosnia ed Erzegovina', 10, 0 UNION ALL
	SELECT 182, 20, 4, N'Bulgaria', 10, 0 UNION ALL
	SELECT 183, 21, 4, N'Croazia', 10, 0 UNION ALL
	SELECT 184, 22, 4, N'Cipro', 10, 0 UNION ALL
	SELECT 185, 23, 4, N'Repubblica Ceca', 10, 0 UNION ALL
	SELECT 186, 24, 4, N'Danimarca', 10, 0 UNION ALL
	SELECT 187, 25, 4, N'Estonia', 10, 0 UNION ALL
	SELECT 188, 26, 4, N'Finlandia', 10, 0 UNION ALL
	SELECT 189, 27, 4, N'Georgia', 10, 0 UNION ALL
	SELECT 190, 28, 4, N'Grecia', 10, 0 UNION ALL
	SELECT 191, 29, 4, N'Ungheria', 10, 0 UNION ALL
	SELECT 192, 30, 4, N'Islanda', 10, 0 UNION ALL
	SELECT 193, 31, 4, N'Irlanda', 10, 0 UNION ALL
	SELECT 194, 32, 4, N'Kazakistan', 10, 0 UNION ALL
	SELECT 195, 33, 4, N'Lettonia', 10, 0 UNION ALL
	SELECT 196, 34, 4, N'Liechtenstein', 10, 0 UNION ALL
	SELECT 197, 35, 4, N'Lituania', 10, 0 UNION ALL
	SELECT 198, 36, 4, N'Lussemburgo', 10, 0 UNION ALL
	SELECT 199, 37, 4, N'Macedonia', 10, 0 UNION ALL
	SELECT 200, 38, 4, N'Malta', 10, 0 UNION ALL
	SELECT 201, 39, 4, N'Moldavia', 10, 0 UNION ALL
	SELECT 202, 40, 4, N'Monaco', 10, 0 UNION ALL
	SELECT 203, 41, 4, N'Montenegro', 10, 0 UNION ALL
	SELECT 204, 42, 4, N'Paesi Bassi', 10, 0 UNION ALL
	SELECT 205, 43, 4, N'Norvegia', 10, 0 UNION ALL
	SELECT 206, 44, 4, N'Portogallo', 10, 0 UNION ALL
	SELECT 207, 45, 4, N'Romania', 10, 0 UNION ALL
	SELECT 208, 46, 4, N'San Marino', 10, 0 UNION ALL
	SELECT 209, 47, 4, N'Serbia', 10, 0 UNION ALL
	SELECT 210, 48, 4, N'Slovacchia', 10, 0 UNION ALL
	SELECT 211, 49, 4, N'Slovenia', 10, 0 UNION ALL
	SELECT 212, 50, 4, N'Svezia', 10, 0 UNION ALL
	SELECT 213, 51, 4, N'Svizzera', 10, 0 UNION ALL
	SELECT 214, 52, 4, N'Turchia', 10, 0 UNION ALL
	SELECT 215, 53, 4, N'Ucraina', 10, 0 UNION ALL
	SELECT 216, 54, 4, N'Regno Unito', 10, 0 UNION ALL
	SELECT 217, 55, 4, N'Città del Vaticano', 10, 0 UNION ALL
	SELECT 218, 56, 4, N'Scozia', 10, 0 UNION ALL
	SELECT 219, 57, 1, N'Brazylia', 10, 1 UNION ALL
	SELECT 220, 57, 2, N'Brazil', 10, 1 UNION ALL
	SELECT 221, 57, 3, N'Brasil', 10, 0 UNION ALL
	SELECT 222, 57, 4, N'Brasile', 10, 0 UNION ALL
	SELECT 223, 58, 1, N'Argentyna', 10, 1 UNION ALL
	SELECT 224, 58, 2, N'Argentina', 10, 1 UNION ALL
	SELECT 225, 58, 3, N'Argentina', 10, 0 UNION ALL
	SELECT 226, 58, 4, N'Argentina', 10, 0 UNION ALL
	SELECT 227, 80, 1, N'Ekwador', 10, 1 UNION ALL
	SELECT 228, 70, 1, N'Paragwaj', 10, 1 UNION ALL
	SELECT 229, 70, 2, N'Paraguay', 10, 1 UNION ALL
	SELECT 230, 80, 2, N'Ecuador', 10, 1 UNION ALL
	SELECT 231, 80, 3, N'Ecuador', 10, 0 UNION ALL
	SELECT 232, 80, 4, N'Ecuador', 10, 0 UNION ALL
	SELECT 233, 70, 3, N'Paraguay', 10, 0 UNION ALL
	SELECT 234, 70, 4, N'Paraguay', 10, 0 UNION ALL
	SELECT 235, 68, 1, N'Urugwaj', 10, 1 UNION ALL
	SELECT 236, 68, 2, N'Uruguay', 10, 1 UNION ALL
	SELECT 237, 68, 3, N'Uruguay', 10, 0 UNION ALL
	SELECT 238, 68, 4, N'Uruguay', 10, 0 UNION ALL
	SELECT 239, 67, 1, N'Wenezuela', 10, 1 UNION ALL
	SELECT 240, 67, 2, N'Venezuela', 10, 1 UNION ALL
	SELECT 241, 67, 3, N'Venezuela', 10, 0 UNION ALL
	SELECT 242, 67, 4, N'Venezuela', 10, 0 UNION ALL
	SELECT 243, 66, 1, N'Kolumbia', 10, 1 UNION ALL
	SELECT 244, 66, 2, N'Colombia', 10, 1 UNION ALL
	SELECT 245, 66, 3, N'Colombia', 10, 0 UNION ALL
	SELECT 246, 66, 4, N'Colombia', 10, 0 UNION ALL
	SELECT 247, 65, 1, N'Chile', 10, 1 UNION ALL
	SELECT 248, 65, 2, N'Chile', 10, 1 UNION ALL
	SELECT 249, 65, 3, N'Chile', 10, 0 UNION ALL
	SELECT 250, 65, 4, N'Cile', 10, 0 UNION ALL
	SELECT 251, 64, 1, N'Boliwia', 10, 1 UNION ALL
	SELECT 252, 64, 2, N'Bolivia', 10, 1 UNION ALL
	SELECT 253, 64, 3, N'Bolivia', 10, 0 UNION ALL
	SELECT 254, 64, 4, N'Bolivia', 10, 0 UNION ALL
	SELECT 255, 63, 1, N'Peru', 10, 1 UNION ALL
	SELECT 256, 63, 2, N'Peru', 10, 1 UNION ALL
	SELECT 257, 63, 3, N'Perú', 10, 0 UNION ALL
	SELECT 258, 63, 4, N'Perù', 10, 0 UNION ALL
	SELECT 259, 85, 1, N'Chiny', 10, 1 UNION ALL
	SELECT 260, 85, 2, N'China', 10, 1 UNION ALL
	SELECT 261, 86, 1, N'Japonia', 10, 1 UNION ALL
	SELECT 262, 86, 2, N'Japan', 10, 1 UNION ALL
	SELECT 263, 89, 1, N'Indie', 10, 1 UNION ALL
	SELECT 264, 89, 2, N'India', 10, 1 UNION ALL
	SELECT 266, 182, 1, N'Kanada', 10, 1 UNION ALL
	SELECT 267, 182, 2, N'Canada', 10, 1 UNION ALL
	SELECT 277, 198, 1, N'Bahamy', 10, 1 UNION ALL
	SELECT 287, 197, 1, N'Belize', 10, 1 UNION ALL
	SELECT 288, 93, 1, N'Tajlandia', 10, 1 UNION ALL
	SELECT 289, 93, 2, N'Thailand', 10, 1 UNION ALL
	SELECT 290, 94, 1, N'Izrael', 10, 1 UNION ALL
	SELECT 291, 94, 2, N'Israel', 10, 1 UNION ALL
	SELECT 292, 95, 1, N'Liban', 10, 1 UNION ALL
	SELECT 293, 95, 2, N'Lebanon', 10, 1 UNION ALL
	SELECT 294, 96, 1, N'Jordania', 10, 1 UNION ALL
	SELECT 295, 96, 2, N'Jordan', 10, 1 UNION ALL
	SELECT 296, 97, 1, N'Syria', 10, 1 UNION ALL
	SELECT 297, 97, 2, N'Syria', 10, 1 UNION ALL
	SELECT 298, 98, 1, N'Arabia Saudyjska', 10, 1 UNION ALL
	SELECT 299, 98, 2, N'Saudi Arabia', 10, 1 UNION ALL
	SELECT 300, 99, 1, N'Jemen', 10, 1 UNION ALL
	SELECT 301, 99, 2, N'Yemen', 10, 1 UNION ALL
	SELECT 302, 100, 1, N'Oman', 10, 1 UNION ALL
	SELECT 303, 100, 2, N'Oman', 10, 1 UNION ALL
	SELECT 304, 101, 1, N'Zjednoczone Emiraty Arabskie', 10, 1 UNION ALL
	SELECT 305, 101, 2, N'United Arab Emirates', 10, 1 UNION ALL
	SELECT 306, 101, 2, N'UAE', 10, 1 UNION ALL
	SELECT 307, 102, 1, N'Kuwejt', 10, 1 UNION ALL
	SELECT 308, 102, 2, N'Kuwait', 10, 1 UNION ALL
	SELECT 309, 193, 1, N'Dominikana', 10, 1 UNION ALL
	SELECT 310, 193, 2, N'Dominican Republic', 10, 1 UNION ALL
	SELECT 311, 174, 1, N'RPA', 10, 1 UNION ALL
	SELECT 312, 174, 1, N'Republika Południowej Afryki', 7, 1 UNION ALL
	SELECT 313, 174, 1, N'Południowa Afryka', 4, 1 UNION ALL
	SELECT 314, 166, 1, N'Kenia', 10, 1 UNION ALL
	SELECT 315, 159, 1, N'Kamerun', 10, 1 UNION ALL
	SELECT 316, 159, 2, N'Cameroon', 10, 1 UNION ALL
	SELECT 317, 158, 1, N'Nigeria', 10, 1 UNION ALL
	SELECT 318, 158, 2, N'Nigeria', 10, 1 UNION ALL
	SELECT 319, 139, 1, N'Algieria', 10, 1 UNION ALL
	SELECT 320, 139, 2, N'Algeria', 10, 1 UNION ALL
	SELECT 321, 184, 1, N'Grenlandia', 10, 1 UNION ALL
	SELECT 322, 167, 1, N'Tanzania', 10, 1 UNION ALL
	SELECT 323, 152, 1, N'Somalia', 10, 0 UNION ALL
	SELECT 324, 149, 1, N'Gambia', 10, 1 UNION ALL
	SELECT 325, 132, 1, N'Australia', 10, 1 UNION ALL
	SELECT 326, 194, 1, N'Haiti', 10, 1 UNION ALL
	SELECT 327, 195, 1, N'Portoryko', 10, 1 UNION ALL
	SELECT 328, 195, 1, N'Puerto Rico', 5, 1 UNION ALL
	SELECT 329, 196, 1, N'Kostaryka', 10, 1 UNION ALL
	SELECT 330, 172, 1, N'Namibia', 10, 1 UNION ALL
	SELECT 331, 191, 1, N'Panama', 10, 1 UNION ALL
	SELECT 332, 190, 1, N'Nikaragua', 10, 1 UNION ALL
	SELECT 333, 175, 1, N'Zambia', 10, 1 UNION ALL
	SELECT 334, 177, 1, N'Botswana', 10, 1 UNION ALL
	SELECT 335, 103, 1, N'Bahrajn', 10, 1 UNION ALL
	SELECT 336, 104, 1, N'Katar', 10, 1 UNION ALL
	SELECT 337, 105, 1, N'Irak', 10, 1 UNION ALL
	SELECT 338, 106, 1, N'Iran', 10, 1 UNION ALL
	SELECT 339, 107, 1, N'Afganistan', 10, 1 UNION ALL
	SELECT 340, 109, 1, N'Pakistan', 10, 1 UNION ALL
	SELECT 341, 110, 1, N'Uzbekistan', 10, 1 UNION ALL
	SELECT 342, 111, 1, N'Turkmenistan', 10, 1 UNION ALL
	SELECT 343, 112, 1, N'Tadżykistan', 10, 1 UNION ALL
	SELECT 344, 113, 1, N'Kirgistan', 10, 1 UNION ALL
	SELECT 345, 114, 1, N'Nepal', 10, 1 UNION ALL
	SELECT 346, 118, 1, N'Mongolia', 10, 1 UNION ALL
	SELECT 347, 115, 1, N'Bhutan', 10, 1 UNION ALL
	SELECT 348, 116, 1, N'Bangladesz', 10, 1 UNION ALL
	SELECT 349, 117, 1, N'Sri Lanka', 10, 1 UNION ALL
	SELECT 350, 119, 1, N'Laos', 10, 1 UNION ALL
	SELECT 351, 120, 1, N'Kambodża', 10, 1 UNION ALL
	SELECT 352, 121, 1, N'Wietnam', 10, 1 UNION ALL
	SELECT 353, 122, 1, N'Myanmar', 10, 1 UNION ALL
	SELECT 354, 122, 1, N'Birma', 6, 1 UNION ALL
	SELECT 355, 123, 1, N'Korea Południowa', 10, 1 UNION ALL
	SELECT 356, 131, 1, N'Singapur', 10, 1 UNION ALL
	SELECT 357, 130, 1, N'Hongkong', 10, 1 UNION ALL
	SELECT 358, 129, 1, N'Tajwan', 10, 1 UNION ALL
	SELECT 359, 128, 1, N'Filipiny', 10, 1 UNION ALL
	SELECT 360, 126, 1, N'Indonezja', 10, 1 UNION ALL
	SELECT 361, 125, 1, N'Malezja', 10, 1 UNION ALL
	SELECT 362, 124, 1, N'Korea Północna', 10, 1 UNION ALL
	SELECT 363, 19, 2, N'Bosnia', 10, 1 UNION ALL
	SELECT 364, 31, 2, N'Ireland', 10, 1 UNION ALL
	SELECT 365, 54, 2, N'UK', 10, 1 UNION ALL
	SELECT 366, 55, 2, N'Vatican', 10, 1 UNION ALL
	SELECT 367, 103, 2, N'Bahrain', 10, 1 UNION ALL
	SELECT 368, 104, 2, N'Qatar', 10, 1 UNION ALL
	SELECT 369, 105, 2, N'Iraq', 10, 1 UNION ALL
	SELECT 370, 106, 2, N'Iran', 10, 1 UNION ALL
	SELECT 371, 107, 2, N'Afghanistan', 10, 1 UNION ALL
	SELECT 372, 109, 2, N'Pakistan', 10, 1 UNION ALL
	SELECT 373, 110, 2, N'Uzbekistan', 10, 1 UNION ALL
	SELECT 374, 111, 2, N'Turkmenistan', 10, 1 UNION ALL
	SELECT 375, 112, 2, N'Tajikistan', 10, 1 UNION ALL
	SELECT 376, 113, 2, N'Kyrgyzstan', 10, 1 UNION ALL
	SELECT 377, 114, 2, N'Nepal', 10, 1 UNION ALL
	SELECT 378, 115, 2, N'Bhutan', 10, 1 UNION ALL
	SELECT 379, 116, 2, N'Bangladesh', 10, 1 UNION ALL
	SELECT 380, 117, 2, N'Sri Lanka', 10, 1 UNION ALL
	SELECT 381, 118, 2, N'Mongolia', 10, 1 UNION ALL
	SELECT 382, 119, 2, N'Laos', 10, 1 UNION ALL
	SELECT 383, 120, 2, N'Cambodia', 10, 1 UNION ALL
	SELECT 384, 121, 2, N'Vietnam', 10, 1 UNION ALL
	SELECT 385, 122, 2, N'Myanmar', 10, 1 UNION ALL
	SELECT 386, 122, 2, N'Burma', 6, 1 UNION ALL
	SELECT 387, 123, 2, N'South Korea', 10, 1 UNION ALL
	SELECT 388, 124, 2, N'North Korea', 10, 1 UNION ALL
	SELECT 389, 125, 2, N'Malaysia', 10, 1 UNION ALL
	SELECT 390, 126, 2, N'Indonesia', 10, 1 UNION ALL
	SELECT 391, 128, 2, N'the Philippines', 10, 1 UNION ALL
	SELECT 392, 129, 2, N'Taiwan', 10, 1 UNION ALL
	SELECT 393, 130, 2, N'Hong Kong', 10, 1 UNION ALL
	SELECT 394, 131, 2, N'Singapore', 10, 1 UNION ALL
	SELECT 395, 132, 2, N'Australia', 10, 1 UNION ALL
	SELECT 396, 133, 2, N'New Zealand', 10, 1 UNION ALL
	SELECT 397, 133, 1, N'Nowa Zelandia', 10, 1 UNION ALL
	SELECT 398, 134, 1, N'Fidżi', 10, 1 UNION ALL
	SELECT 399, 134, 2, N'Fiji', 10, 1 UNION ALL
	SELECT 400, 198, 2, N'the Bahamas', 10, 1 UNION ALL
	SELECT 401, 197, 2, N'Belize', 10, 1 UNION ALL
	SELECT 402, 196, 2, N'Costa Rica', 10, 1 UNION ALL
	SELECT 403, 195, 2, N'Puerto Rico', 10, 1 UNION ALL
	SELECT 404, 194, 2, N'Haiti', 10, 1 UNION ALL
	SELECT 405, 183, 1, N'Meksyk', 10, 1 UNION ALL
	SELECT 406, 183, 2, N'Mexico', 10, 1 UNION ALL
	SELECT 407, 184, 2, N'Greenland', 10, 1 UNION ALL
	SELECT 408, 185, 1, N'Jamajka', 10, 1 UNION ALL
	SELECT 409, 185, 2, N'Jamaica', 10, 1 UNION ALL
	SELECT 410, 186, 1, N'Kuba', 10, 1 UNION ALL
	SELECT 411, 186, 2, N'Cuba', 10, 1 UNION ALL
	SELECT 412, 187, 1, N'Honduras', 10, 1 UNION ALL
	SELECT 413, 187, 2, N'Honduras', 10, 1 UNION ALL
	SELECT 414, 188, 1, N'Salwador', 10, 1 UNION ALL
	SELECT 415, 188, 2, N'El Salvador', 10, 1 UNION ALL
	SELECT 416, 189, 1, N'Gwatemala', 10, 1 UNION ALL
	SELECT 417, 189, 2, N'Guatemala', 10, 1 UNION ALL
	SELECT 418, 171, 1, N'Angola', 10, 1 UNION ALL
	SELECT 419, 171, 2, N'Angola', 10, 1 UNION ALL
	SELECT 420, 155, 1, N'Liberia', 10, 1 UNION ALL
	SELECT 421, 190, 2, N'Nicaragua', 10, 1 UNION ALL
	SELECT 422, 191, 2, N'Panama', 10, 1 UNION ALL
	SELECT 423, 170, 1, N'Madagaskar', 10, 1 UNION ALL
	SELECT 424, 170, 2, N'Madagascar', 10, 1 UNION ALL
	SELECT 425, 172, 2, N'Namibia', 10, 1 UNION ALL
	SELECT 426, 174, 2, N'South Africa', 10, 1 UNION ALL
	SELECT 427, 176, 1, N'Zimbabwe', 10, 1 UNION ALL
	SELECT 428, 176, 2, N'Zimbabwe', 10, 1 UNION ALL
	SELECT 429, 178, 1, N'Seszele', 10, 1 UNION ALL
	SELECT 430, 178, 2, N'Seychelles', 10, 1 UNION ALL
	SELECT 431, 180, 1, N'Mauritius', 10, 1 UNION ALL
	SELECT 432, 180, 2, N'Mauritius', 10, 1 UNION ALL
	SELECT 433, 181, 1, N'USA', 10, 1 UNION ALL
	SELECT 434, 181, 1, N'Stany Zjednoczone', 5, 1 UNION ALL
	SELECT 435, 181, 2, N'the USA', 10, 1 UNION ALL
	SELECT 436, 181, 2, N'the United States', 10, 1 UNION ALL
	SELECT 437, 175, 2, N'Zambia', 10, 1 UNION ALL
	SELECT 438, 177, 2, N'Botswana', 10, 1 UNION ALL
	SELECT 439, 166, 2, N'Kenya', 10, 1 UNION ALL
	SELECT 440, 167, 2, N'Tanzania', 10, 1 UNION ALL
	SELECT 441, 168, 1, N'Mozambik', 10, 1 UNION ALL
	SELECT 442, 168, 2, N'Mozambique', 10, 1 UNION ALL
	SELECT 443, 169, 1, N'Ruanda', 10, 1 UNION ALL
	SELECT 444, 169, 1, N'Rwanda', 10, 1 UNION ALL
	SELECT 445, 169, 2, N'Rwanda', 10, 1 UNION ALL
	SELECT 446, 165, 1, N'Burundi', 10, 1 UNION ALL
	SELECT 447, 165, 2, N'Burundi', 10, 1 UNION ALL
	SELECT 448, 164, 1, N'Uganda', 10, 1 UNION ALL
	SELECT 449, 164, 2, N'Uganda', 10, 1 UNION ALL
	SELECT 450, 162, 1, N'Kongo', 10, 1 UNION ALL
	SELECT 451, 162, 2, N'Congo', 10, 1 UNION ALL
	SELECT 452, 160, 1, N'Gabon', 10, 1 UNION ALL
	SELECT 453, 160, 2, N'Gabon', 10, 1 UNION ALL
	SELECT 454, 163, 1, N'Demokratyczna Republika Konga', 10, 1
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
	SELECT 10, 11, 2, 5 UNION ALL
	SELECT 100, 55, 7, 15 UNION ALL
	SELECT 101, 56, 1, 1 UNION ALL
	SELECT 102, 56, 2, 5 UNION ALL
	SELECT 103, 56, 3, 14 UNION ALL
	SELECT 104, 56, 7, 15 UNION ALL
	SELECT 105, 57, 1, 2 UNION ALL
	SELECT 106, 57, 2, 4 UNION ALL
	SELECT 107, 57, 3, 14 UNION ALL
	SELECT 108, 57, 7, 15 UNION ALL
	SELECT 109, 58, 1, 2 UNION ALL
	SELECT 11, 11, 3, 14 UNION ALL
	SELECT 110, 58, 2, 4 UNION ALL
	SELECT 111, 58, 3, 14 UNION ALL
	SELECT 112, 58, 7, 15 UNION ALL
	SELECT 113, 59, 1, 1 UNION ALL
	SELECT 114, 59, 2, 4 UNION ALL
	SELECT 115, 59, 3, 14 UNION ALL
	SELECT 116, 59, 7, 15 UNION ALL
	SELECT 117, 60, 1, 2 UNION ALL
	SELECT 118, 60, 2, 4 UNION ALL
	SELECT 119, 60, 3, 14 UNION ALL
	SELECT 12, 11, 7, 15 UNION ALL
	SELECT 120, 60, 7, 15 UNION ALL
	SELECT 121, 61, 1, 1 UNION ALL
	SELECT 122, 61, 2, 4 UNION ALL
	SELECT 123, 61, 3, 14 UNION ALL
	SELECT 124, 61, 7, 15 UNION ALL
	SELECT 125, 62, 1, 2 UNION ALL
	SELECT 126, 62, 2, 4 UNION ALL
	SELECT 127, 62, 3, 14 UNION ALL
	SELECT 128, 62, 7, 15 UNION ALL
	SELECT 129, 63, 1, 1 UNION ALL
	SELECT 13, 15, 1, 2 UNION ALL
	SELECT 130, 63, 2, 4 UNION ALL
	SELECT 131, 63, 3, 14 UNION ALL
	SELECT 132, 63, 7, 15 UNION ALL
	SELECT 133, 64, 1, 2 UNION ALL
	SELECT 134, 64, 2, 4 UNION ALL
	SELECT 135, 64, 3, 14 UNION ALL
	SELECT 136, 64, 7, 15 UNION ALL
	SELECT 137, 65, 1, 2 UNION ALL
	SELECT 138, 65, 2, 4 UNION ALL
	SELECT 139, 65, 3, 14 UNION ALL
	SELECT 14, 15, 2, 4 UNION ALL
	SELECT 140, 65, 7, 15 UNION ALL
	SELECT 141, 66, 1, 2 UNION ALL
	SELECT 142, 66, 2, 4 UNION ALL
	SELECT 143, 66, 3, 14 UNION ALL
	SELECT 144, 66, 7, 15 UNION ALL
	SELECT 145, 67, 1, 3 UNION ALL
	SELECT 146, 67, 2, 4 UNION ALL
	SELECT 147, 67, 3, 14 UNION ALL
	SELECT 148, 67, 7, 15 UNION ALL
	SELECT 149, 68, 1, 2 UNION ALL
	SELECT 15, 15, 3, 14 UNION ALL
	SELECT 150, 68, 2, 4 UNION ALL
	SELECT 151, 68, 3, 14 UNION ALL
	SELECT 152, 68, 7, 15 UNION ALL
	SELECT 153, 69, 1, 2 UNION ALL
	SELECT 154, 69, 2, 4 UNION ALL
	SELECT 155, 69, 3, 14 UNION ALL
	SELECT 156, 69, 7, 15 UNION ALL
	SELECT 157, 70, 1, 2 UNION ALL
	SELECT 158, 70, 2, 4 UNION ALL
	SELECT 159, 70, 3, 14 UNION ALL
	SELECT 16, 15, 7, 15 UNION ALL
	SELECT 160, 70, 7, 15 UNION ALL
	SELECT 161, 71, 1, 2 UNION ALL
	SELECT 162, 71, 2, 4 UNION ALL
	SELECT 163, 71, 3, 14 UNION ALL
	SELECT 164, 71, 7, 15 UNION ALL
	SELECT 165, 72, 1, 2 UNION ALL
	SELECT 166, 72, 2, 4 UNION ALL
	SELECT 167, 72, 3, 14 UNION ALL
	SELECT 168, 72, 7, 15 UNION ALL
	SELECT 169, 73, 1, 3 UNION ALL
	SELECT 17, 19, 1, 2 UNION ALL
	SELECT 170, 73, 2, 4 UNION ALL
	SELECT 171, 73, 3, 14 UNION ALL
	SELECT 172, 73, 7, 15 UNION ALL
	SELECT 173, 74, 1, 2 UNION ALL
	SELECT 174, 74, 2, 4 UNION ALL
	SELECT 175, 74, 3, 14 UNION ALL
	SELECT 176, 74, 7, 15 UNION ALL
	SELECT 177, 75, 1, 2 UNION ALL
	SELECT 178, 75, 2, 4 UNION ALL
	SELECT 179, 75, 3, 14 UNION ALL
	SELECT 18, 19, 2, 4 UNION ALL
	SELECT 180, 75, 7, 15 UNION ALL
	SELECT 181, 76, 1, 2 UNION ALL
	SELECT 182, 76, 2, 4 UNION ALL
	SELECT 183, 76, 3, 14 UNION ALL
	SELECT 184, 76, 7, 15 UNION ALL
	SELECT 185, 77, 1, 2 UNION ALL
	SELECT 186, 77, 2, 4 UNION ALL
	SELECT 187, 77, 3, 14 UNION ALL
	SELECT 188, 77, 7, 15 UNION ALL
	SELECT 189, 78, 1, 2 UNION ALL
	SELECT 19, 19, 3, 14 UNION ALL
	SELECT 190, 78, 2, 4 UNION ALL
	SELECT 191, 78, 3, 14 UNION ALL
	SELECT 192, 78, 7, 15 UNION ALL
	SELECT 193, 79, 1, 2 UNION ALL
	SELECT 194, 79, 2, 4 UNION ALL
	SELECT 195, 79, 3, 14 UNION ALL
	SELECT 196, 79, 7, 15 UNION ALL
	SELECT 197, 80, 1, 2 UNION ALL
	SELECT 198, 80, 2, 4 UNION ALL
	SELECT 199, 80, 3, 14 UNION ALL
	SELECT 2, 1, 2, 4 UNION ALL
	SELECT 20, 19, 7, 15 UNION ALL
	SELECT 200, 80, 7, 15 UNION ALL
	SELECT 201, 81, 1, 2 UNION ALL
	SELECT 202, 81, 2, 4 UNION ALL
	SELECT 203, 81, 3, 14 UNION ALL
	SELECT 204, 81, 7, 15 UNION ALL
	SELECT 205, 82, 1, 1 UNION ALL
	SELECT 206, 82, 2, 4 UNION ALL
	SELECT 207, 82, 3, 14 UNION ALL
	SELECT 208, 82, 7, 15 UNION ALL
	SELECT 209, 83, 1, 2 UNION ALL
	SELECT 21, 23, 1, 1 UNION ALL
	SELECT 210, 83, 2, 4 UNION ALL
	SELECT 211, 83, 3, 14 UNION ALL
	SELECT 212, 83, 7, 15 UNION ALL
	SELECT 213, 219, 1, 2 UNION ALL
	SELECT 214, 219, 2, 4 UNION ALL
	SELECT 215, 219, 3, 14 UNION ALL
	SELECT 216, 219, 7, 15 UNION ALL
	SELECT 217, 223, 1, 2 UNION ALL
	SELECT 218, 223, 2, 4 UNION ALL
	SELECT 219, 223, 3, 14 UNION ALL
	SELECT 22, 23, 2, 5 UNION ALL
	SELECT 220, 223, 7, 15 UNION ALL
	SELECT 221, 227, 1, 1 UNION ALL
	SELECT 222, 227, 2, 4 UNION ALL
	SELECT 223, 227, 3, 14 UNION ALL
	SELECT 224, 227, 7, 15 UNION ALL
	SELECT 225, 228, 1, 1 UNION ALL
	SELECT 226, 228, 2, 4 UNION ALL
	SELECT 227, 228, 3, 14 UNION ALL
	SELECT 228, 228, 7, 15 UNION ALL
	SELECT 229, 235, 1, 1 UNION ALL
	SELECT 23, 23, 3, 14 UNION ALL
	SELECT 230, 235, 2, 4 UNION ALL
	SELECT 231, 235, 3, 14 UNION ALL
	SELECT 232, 235, 7, 15 UNION ALL
	SELECT 233, 239, 1, 2 UNION ALL
	SELECT 234, 239, 2, 4 UNION ALL
	SELECT 235, 239, 3, 14 UNION ALL
	SELECT 236, 239, 7, 15 UNION ALL
	SELECT 237, 243, 1, 2 UNION ALL
	SELECT 238, 243, 2, 4 UNION ALL
	SELECT 239, 243, 3, 14 UNION ALL
	SELECT 24, 23, 7, 15 UNION ALL
	SELECT 240, 243, 7, 15 UNION ALL
	SELECT 241, 247, 1, 3 UNION ALL
	SELECT 242, 247, 2, 4 UNION ALL
	SELECT 243, 247, 3, 14 UNION ALL
	SELECT 244, 247, 7, 15 UNION ALL
	SELECT 245, 251, 1, 2 UNION ALL
	SELECT 246, 251, 2, 4 UNION ALL
	SELECT 247, 251, 3, 14 UNION ALL
	SELECT 248, 251, 7, 15 UNION ALL
	SELECT 249, 255, 1, 3 UNION ALL
	SELECT 25, 27, 1, 2 UNION ALL
	SELECT 250, 255, 2, 4 UNION ALL
	SELECT 251, 255, 3, 14 UNION ALL
	SELECT 252, 255, 7, 15 UNION ALL
	SELECT 253, 259, 1, 1 UNION ALL
	SELECT 254, 259, 2, 5 UNION ALL
	SELECT 255, 259, 3, 14 UNION ALL
	SELECT 256, 259, 7, 15 UNION ALL
	SELECT 257, 261, 1, 2 UNION ALL
	SELECT 258, 261, 2, 4 UNION ALL
	SELECT 259, 261, 3, 14 UNION ALL
	SELECT 26, 27, 2, 4 UNION ALL
	SELECT 260, 261, 7, 15 UNION ALL
	SELECT 261, 263, 1, 1 UNION ALL
	SELECT 262, 263, 2, 5 UNION ALL
	SELECT 263, 263, 3, 14 UNION ALL
	SELECT 264, 263, 7, 15 UNION ALL
	SELECT 265, 266, 1, 2 UNION ALL
	SELECT 266, 266, 2, 4 UNION ALL
	SELECT 267, 266, 3, 14 UNION ALL
	SELECT 268, 266, 7, 15 UNION ALL
	SELECT 269, 277, 1, 1 UNION ALL
	SELECT 27, 27, 3, 14 UNION ALL
	SELECT 270, 277, 2, 5 UNION ALL
	SELECT 271, 277, 3, 14 UNION ALL
	SELECT 272, 277, 7, 15 UNION ALL
	SELECT 273, 287, 1, 3 UNION ALL
	SELECT 274, 287, 2, 4 UNION ALL
	SELECT 275, 287, 3, 14 UNION ALL
	SELECT 276, 287, 7, 15 UNION ALL
	SELECT 277, 288, 1, 2 UNION ALL
	SELECT 278, 288, 2, 4 UNION ALL
	SELECT 279, 288, 3, 14 UNION ALL
	SELECT 28, 27, 7, 15 UNION ALL
	SELECT 280, 288, 7, 15 UNION ALL
	SELECT 281, 290, 1, 1 UNION ALL
	SELECT 282, 290, 2, 4 UNION ALL
	SELECT 283, 290, 3, 14 UNION ALL
	SELECT 284, 290, 7, 15 UNION ALL
	SELECT 285, 292, 1, 1 UNION ALL
	SELECT 286, 292, 2, 4 UNION ALL
	SELECT 287, 292, 3, 14 UNION ALL
	SELECT 288, 292, 7, 15 UNION ALL
	SELECT 289, 294, 1, 2 UNION ALL
	SELECT 29, 31, 1, 2 UNION ALL
	SELECT 290, 294, 2, 4 UNION ALL
	SELECT 291, 294, 3, 14 UNION ALL
	SELECT 292, 294, 7, 15 UNION ALL
	SELECT 293, 296, 1, 2 UNION ALL
	SELECT 294, 296, 2, 4 UNION ALL
	SELECT 295, 296, 3, 14 UNION ALL
	SELECT 296, 296, 7, 15 UNION ALL
	SELECT 297, 298, 1, 2 UNION ALL
	SELECT 298, 298, 2, 4 UNION ALL
	SELECT 299, 298, 3, 14 UNION ALL
	SELECT 3, 1, 3, 14 UNION ALL
	SELECT 30, 31, 2, 4 UNION ALL
	SELECT 300, 298, 7, 15 UNION ALL
	SELECT 301, 300, 1, 1 UNION ALL
	SELECT 302, 300, 2, 4 UNION ALL
	SELECT 303, 300, 3, 14 UNION ALL
	SELECT 304, 300, 7, 15 UNION ALL
	SELECT 305, 302, 1, 1 UNION ALL
	SELECT 306, 302, 2, 4 UNION ALL
	SELECT 307, 302, 3, 14 UNION ALL
	SELECT 308, 302, 7, 15 UNION ALL
	SELECT 309, 304, 1, 1 UNION ALL
	SELECT 31, 31, 3, 14 UNION ALL
	SELECT 310, 304, 2, 5 UNION ALL
	SELECT 311, 304, 3, 14 UNION ALL
	SELECT 312, 304, 7, 15 UNION ALL
	SELECT 313, 307, 1, 1 UNION ALL
	SELECT 314, 307, 2, 4 UNION ALL
	SELECT 315, 307, 3, 14 UNION ALL
	SELECT 316, 307, 7, 15 UNION ALL
	SELECT 317, 309, 1, 2 UNION ALL
	SELECT 318, 309, 2, 4 UNION ALL
	SELECT 319, 309, 3, 14 UNION ALL
	SELECT 32, 31, 7, 15 UNION ALL
	SELECT 320, 309, 7, 15 UNION ALL
	SELECT 321, 311, 1, 1 UNION ALL
	SELECT 322, 311, 2, 4 UNION ALL
	SELECT 323, 311, 3, 14 UNION ALL
	SELECT 324, 311, 7, 15 UNION ALL
	SELECT 325, 312, 1, 2 UNION ALL
	SELECT 326, 312, 2, 4 UNION ALL
	SELECT 327, 312, 3, 14 UNION ALL
	SELECT 328, 312, 7, 15 UNION ALL
	SELECT 329, 313, 1, 2 UNION ALL
	SELECT 33, 35, 1, 2 UNION ALL
	SELECT 330, 313, 2, 4 UNION ALL
	SELECT 331, 313, 3, 14 UNION ALL
	SELECT 332, 313, 7, 15 UNION ALL
	SELECT 333, 314, 1, 2 UNION ALL
	SELECT 334, 314, 2, 4 UNION ALL
	SELECT 335, 314, 3, 14 UNION ALL
	SELECT 336, 314, 7, 15 UNION ALL
	SELECT 337, 315, 1, 1 UNION ALL
	SELECT 338, 315, 2, 4 UNION ALL
	SELECT 339, 315, 3, 14 UNION ALL
	SELECT 34, 35, 2, 4 UNION ALL
	SELECT 340, 315, 7, 15 UNION ALL
	SELECT 341, 317, 1, 2 UNION ALL
	SELECT 342, 317, 2, 4 UNION ALL
	SELECT 343, 317, 3, 14 UNION ALL
	SELECT 344, 317, 7, 15 UNION ALL
	SELECT 345, 319, 1, 2 UNION ALL
	SELECT 346, 319, 2, 4 UNION ALL
	SELECT 347, 319, 3, 14 UNION ALL
	SELECT 348, 319, 7, 15 UNION ALL
	SELECT 349, 321, 1, 2 UNION ALL
	SELECT 35, 35, 3, 14 UNION ALL
	SELECT 350, 321, 2, 4 UNION ALL
	SELECT 351, 321, 3, 14 UNION ALL
	SELECT 352, 321, 7, 15 UNION ALL
	SELECT 353, 322, 1, 2 UNION ALL
	SELECT 354, 322, 2, 4 UNION ALL
	SELECT 355, 322, 3, 14 UNION ALL
	SELECT 356, 322, 7, 15 UNION ALL
	SELECT 357, 323, 1, 2 UNION ALL
	SELECT 358, 323, 2, 4 UNION ALL
	SELECT 359, 323, 3, 14 UNION ALL
	SELECT 36, 35, 7, 15 UNION ALL
	SELECT 360, 323, 7, 15 UNION ALL
	SELECT 361, 324, 1, 2 UNION ALL
	SELECT 362, 324, 2, 4 UNION ALL
	SELECT 363, 324, 3, 14 UNION ALL
	SELECT 364, 324, 7, 15 UNION ALL
	SELECT 365, 325, 1, 2 UNION ALL
	SELECT 366, 325, 2, 4 UNION ALL
	SELECT 367, 325, 3, 14 UNION ALL
	SELECT 368, 325, 7, 15 UNION ALL
	SELECT 369, 326, 1, 3 UNION ALL
	SELECT 37, 40, 1, 2 UNION ALL
	SELECT 370, 326, 2, 4 UNION ALL
	SELECT 371, 326, 3, 14 UNION ALL
	SELECT 372, 326, 7, 15 UNION ALL
	SELECT 373, 327, 1, 3 UNION ALL
	SELECT 374, 327, 2, 4 UNION ALL
	SELECT 375, 327, 3, 14 UNION ALL
	SELECT 376, 327, 7, 15 UNION ALL
	SELECT 377, 328, 1, 3 UNION ALL
	SELECT 378, 328, 2, 4 UNION ALL
	SELECT 379, 328, 3, 14 UNION ALL
	SELECT 38, 40, 2, 4 UNION ALL
	SELECT 380, 328, 7, 15 UNION ALL
	SELECT 381, 329, 1, 2 UNION ALL
	SELECT 382, 329, 2, 4 UNION ALL
	SELECT 383, 329, 3, 14 UNION ALL
	SELECT 384, 329, 7, 15 UNION ALL
	SELECT 385, 330, 1, 2 UNION ALL
	SELECT 386, 330, 2, 4 UNION ALL
	SELECT 387, 330, 3, 14 UNION ALL
	SELECT 388, 330, 7, 15 UNION ALL
	SELECT 389, 331, 1, 2 UNION ALL
	SELECT 39, 40, 3, 14 UNION ALL
	SELECT 390, 331, 2, 4 UNION ALL
	SELECT 391, 331, 3, 14 UNION ALL
	SELECT 392, 331, 7, 15 UNION ALL
	SELECT 393, 332, 1, 2 UNION ALL
	SELECT 394, 332, 2, 4 UNION ALL
	SELECT 395, 332, 3, 14 UNION ALL
	SELECT 396, 332, 7, 15 UNION ALL
	SELECT 397, 333, 1, 2 UNION ALL
	SELECT 398, 333, 2, 4 UNION ALL
	SELECT 399, 333, 3, 14 UNION ALL
	SELECT 4, 1, 7, 15 UNION ALL
	SELECT 40, 40, 7, 15 UNION ALL
	SELECT 400, 333, 7, 15 UNION ALL
	SELECT 401, 334, 1, 2 UNION ALL
	SELECT 402, 334, 2, 4 UNION ALL
	SELECT 403, 334, 3, 14 UNION ALL
	SELECT 404, 334, 7, 15 UNION ALL
	SELECT 405, 335, 1, 1 UNION ALL
	SELECT 406, 335, 2, 4 UNION ALL
	SELECT 407, 335, 3, 14 UNION ALL
	SELECT 408, 335, 7, 15 UNION ALL
	SELECT 409, 336, 1, 1 UNION ALL
	SELECT 41, 41, 1, 2 UNION ALL
	SELECT 410, 336, 2, 4 UNION ALL
	SELECT 411, 336, 3, 14 UNION ALL
	SELECT 412, 336, 7, 15 UNION ALL
	SELECT 413, 337, 1, 1 UNION ALL
	SELECT 414, 337, 2, 4 UNION ALL
	SELECT 415, 337, 3, 14 UNION ALL
	SELECT 416, 337, 7, 15 UNION ALL
	SELECT 417, 338, 1, 1 UNION ALL
	SELECT 418, 338, 2, 4 UNION ALL
	SELECT 419, 338, 3, 14 UNION ALL
	SELECT 42, 41, 2, 4 UNION ALL
	SELECT 420, 338, 7, 15 UNION ALL
	SELECT 421, 339, 1, 1 UNION ALL
	SELECT 422, 339, 2, 4 UNION ALL
	SELECT 423, 339, 3, 14 UNION ALL
	SELECT 424, 339, 7, 15 UNION ALL
	SELECT 425, 340, 1, 1 UNION ALL
	SELECT 426, 340, 2, 4 UNION ALL
	SELECT 427, 340, 3, 14 UNION ALL
	SELECT 428, 340, 7, 15 UNION ALL
	SELECT 429, 341, 1, 1 UNION ALL
	SELECT 43, 41, 3, 14 UNION ALL
	SELECT 430, 341, 2, 4 UNION ALL
	SELECT 431, 341, 3, 14 UNION ALL
	SELECT 432, 341, 7, 15 UNION ALL
	SELECT 433, 342, 1, 1 UNION ALL
	SELECT 434, 342, 2, 4 UNION ALL
	SELECT 435, 342, 3, 14 UNION ALL
	SELECT 436, 342, 7, 15 UNION ALL
	SELECT 437, 343, 1, 1 UNION ALL
	SELECT 438, 343, 2, 4 UNION ALL
	SELECT 439, 343, 3, 14 UNION ALL
	SELECT 44, 41, 7, 15 UNION ALL
	SELECT 440, 343, 7, 15 UNION ALL
	SELECT 441, 344, 1, 1 UNION ALL
	SELECT 442, 344, 2, 4 UNION ALL
	SELECT 443, 344, 3, 14 UNION ALL
	SELECT 444, 344, 7, 15 UNION ALL
	SELECT 445, 345, 1, 1 UNION ALL
	SELECT 446, 345, 2, 4 UNION ALL
	SELECT 447, 345, 3, 14 UNION ALL
	SELECT 448, 345, 7, 15 UNION ALL
	SELECT 449, 346, 1, 2 UNION ALL
	SELECT 45, 42, 1, 2 UNION ALL
	SELECT 450, 346, 2, 4 UNION ALL
	SELECT 451, 346, 3, 14 UNION ALL
	SELECT 452, 346, 7, 15 UNION ALL
	SELECT 453, 347, 1, 1 UNION ALL
	SELECT 454, 347, 2, 4 UNION ALL
	SELECT 455, 347, 3, 14 UNION ALL
	SELECT 456, 347, 7, 15 UNION ALL
	SELECT 457, 348, 1, 1 UNION ALL
	SELECT 458, 348, 2, 4 UNION ALL
	SELECT 459, 348, 3, 14 UNION ALL
	SELECT 46, 42, 2, 4 UNION ALL
	SELECT 460, 348, 7, 15 UNION ALL
	SELECT 461, 349, 1, 2 UNION ALL
	SELECT 462, 349, 2, 4 UNION ALL
	SELECT 463, 349, 3, 14 UNION ALL
	SELECT 464, 349, 7, 15 UNION ALL
	SELECT 465, 350, 1, 1 UNION ALL
	SELECT 466, 350, 2, 4 UNION ALL
	SELECT 467, 350, 3, 14 UNION ALL
	SELECT 468, 350, 7, 15 UNION ALL
	SELECT 469, 351, 1, 2 UNION ALL
	SELECT 47, 42, 3, 14 UNION ALL
	SELECT 470, 351, 2, 4 UNION ALL
	SELECT 471, 351, 3, 14 UNION ALL
	SELECT 472, 351, 7, 15 UNION ALL
	SELECT 473, 352, 1, 1 UNION ALL
	SELECT 474, 352, 2, 4 UNION ALL
	SELECT 475, 352, 3, 14 UNION ALL
	SELECT 476, 352, 7, 15 UNION ALL
	SELECT 477, 353, 1, 1 UNION ALL
	SELECT 478, 353, 2, 4 UNION ALL
	SELECT 479, 353, 3, 14 UNION ALL
	SELECT 48, 42, 7, 15 UNION ALL
	SELECT 480, 353, 7, 15 UNION ALL
	SELECT 481, 354, 1, 2 UNION ALL
	SELECT 482, 354, 2, 4 UNION ALL
	SELECT 483, 354, 3, 14 UNION ALL
	SELECT 484, 354, 7, 15 UNION ALL
	SELECT 485, 355, 1, 2 UNION ALL
	SELECT 486, 355, 2, 4 UNION ALL
	SELECT 487, 355, 3, 14 UNION ALL
	SELECT 488, 355, 7, 15 UNION ALL
	SELECT 489, 356, 1, 1 UNION ALL
	SELECT 49, 43, 1, 1 UNION ALL
	SELECT 490, 356, 2, 4 UNION ALL
	SELECT 491, 356, 3, 14 UNION ALL
	SELECT 492, 356, 7, 15 UNION ALL
	SELECT 493, 357, 1, 1 UNION ALL
	SELECT 494, 357, 2, 4 UNION ALL
	SELECT 495, 357, 3, 14 UNION ALL
	SELECT 496, 357, 7, 15 UNION ALL
	SELECT 497, 358, 1, 1 UNION ALL
	SELECT 498, 358, 2, 4 UNION ALL
	SELECT 499, 358, 3, 14 UNION ALL
	SELECT 5, 3, 1, 1 UNION ALL
	SELECT 50, 43, 2, 4 UNION ALL
	SELECT 500, 358, 7, 15 UNION ALL
	SELECT 501, 359, 1, 1 UNION ALL
	SELECT 502, 359, 2, 5 UNION ALL
	SELECT 503, 359, 3, 14 UNION ALL
	SELECT 504, 359, 7, 15 UNION ALL
	SELECT 505, 360, 1, 2 UNION ALL
	SELECT 506, 360, 2, 4 UNION ALL
	SELECT 507, 360, 3, 14 UNION ALL
	SELECT 508, 360, 7, 15 UNION ALL
	SELECT 509, 361, 1, 2 UNION ALL
	SELECT 51, 43, 3, 14 UNION ALL
	SELECT 510, 361, 2, 4 UNION ALL
	SELECT 511, 361, 3, 14 UNION ALL
	SELECT 512, 361, 7, 15 UNION ALL
	SELECT 513, 362, 1, 2 UNION ALL
	SELECT 514, 362, 2, 4 UNION ALL
	SELECT 515, 362, 3, 14 UNION ALL
	SELECT 516, 362, 7, 15 UNION ALL
	SELECT 517, 397, 1, 2 UNION ALL
	SELECT 518, 397, 2, 4 UNION ALL
	SELECT 519, 397, 3, 14 UNION ALL
	SELECT 52, 43, 7, 15 UNION ALL
	SELECT 520, 397, 7, 15 UNION ALL
	SELECT 521, 398, 1, 3 UNION ALL
	SELECT 522, 398, 2, 4 UNION ALL
	SELECT 523, 398, 3, 14 UNION ALL
	SELECT 524, 398, 7, 15 UNION ALL
	SELECT 525, 405, 1, 1 UNION ALL
	SELECT 526, 405, 2, 4 UNION ALL
	SELECT 527, 405, 3, 14 UNION ALL
	SELECT 528, 405, 7, 15 UNION ALL
	SELECT 529, 408, 1, 2 UNION ALL
	SELECT 53, 44, 1, 2 UNION ALL
	SELECT 530, 408, 2, 4 UNION ALL
	SELECT 531, 408, 3, 14 UNION ALL
	SELECT 532, 408, 7, 15 UNION ALL
	SELECT 533, 410, 1, 2 UNION ALL
	SELECT 534, 410, 2, 4 UNION ALL
	SELECT 535, 410, 3, 14 UNION ALL
	SELECT 536, 410, 7, 15 UNION ALL
	SELECT 537, 412, 1, 1 UNION ALL
	SELECT 538, 412, 2, 4 UNION ALL
	SELECT 539, 412, 3, 14 UNION ALL
	SELECT 54, 44, 2, 4 UNION ALL
	SELECT 540, 412, 7, 15 UNION ALL
	SELECT 541, 414, 1, 1 UNION ALL
	SELECT 542, 414, 2, 4 UNION ALL
	SELECT 543, 414, 3, 14 UNION ALL
	SELECT 544, 414, 7, 15 UNION ALL
	SELECT 545, 416, 1, 2 UNION ALL
	SELECT 546, 416, 2, 4 UNION ALL
	SELECT 547, 416, 3, 14 UNION ALL
	SELECT 548, 416, 7, 15 UNION ALL
	SELECT 549, 418, 1, 2 UNION ALL
	SELECT 55, 44, 3, 14 UNION ALL
	SELECT 550, 418, 2, 4 UNION ALL
	SELECT 551, 418, 3, 14 UNION ALL
	SELECT 552, 418, 7, 15 UNION ALL
	SELECT 553, 420, 1, 2 UNION ALL
	SELECT 554, 420, 2, 4 UNION ALL
	SELECT 555, 420, 3, 14 UNION ALL
	SELECT 556, 420, 7, 15 UNION ALL
	SELECT 557, 423, 1, 1 UNION ALL
	SELECT 558, 423, 2, 4 UNION ALL
	SELECT 559, 423, 3, 14 UNION ALL
	SELECT 56, 44, 7, 15 UNION ALL
	SELECT 560, 423, 7, 15 UNION ALL
	SELECT 561, 427, 1, 3 UNION ALL
	SELECT 562, 427, 2, 4 UNION ALL
	SELECT 563, 427, 3, 14 UNION ALL
	SELECT 564, 427, 7, 15 UNION ALL
	SELECT 565, 429, 1, 3 UNION ALL
	SELECT 566, 429, 2, 4 UNION ALL
	SELECT 567, 429, 3, 14 UNION ALL
	SELECT 568, 429, 7, 15 UNION ALL
	SELECT 569, 431, 1, 1 UNION ALL
	SELECT 57, 45, 1, 2 UNION ALL
	SELECT 570, 431, 2, 4 UNION ALL
	SELECT 571, 431, 3, 14 UNION ALL
	SELECT 572, 431, 7, 15 UNION ALL
	SELECT 573, 433, 1, 1 UNION ALL
	SELECT 574, 433, 2, 5 UNION ALL
	SELECT 575, 433, 3, 14 UNION ALL
	SELECT 576, 433, 7, 15 UNION ALL
	SELECT 577, 434, 1, 1 UNION ALL
	SELECT 578, 434, 2, 5 UNION ALL
	SELECT 579, 434, 3, 14 UNION ALL
	SELECT 58, 45, 2, 4 UNION ALL
	SELECT 580, 434, 7, 15 UNION ALL
	SELECT 581, 441, 1, 1 UNION ALL
	SELECT 582, 441, 2, 4 UNION ALL
	SELECT 583, 441, 3, 14 UNION ALL
	SELECT 584, 441, 7, 15 UNION ALL
	SELECT 585, 443, 1, 2 UNION ALL
	SELECT 586, 443, 2, 4 UNION ALL
	SELECT 587, 443, 3, 14 UNION ALL
	SELECT 588, 443, 7, 15 UNION ALL
	SELECT 589, 444, 1, 2 UNION ALL
	SELECT 59, 45, 3, 14 UNION ALL
	SELECT 590, 444, 2, 4 UNION ALL
	SELECT 591, 444, 3, 14 UNION ALL
	SELECT 592, 444, 7, 15 UNION ALL
	SELECT 593, 446, 1, 3 UNION ALL
	SELECT 594, 446, 2, 4 UNION ALL
	SELECT 595, 446, 3, 14 UNION ALL
	SELECT 596, 446, 7, 15 UNION ALL
	SELECT 597, 448, 1, 2 UNION ALL
	SELECT 598, 448, 2, 4 UNION ALL
	SELECT 599, 448, 3, 14 UNION ALL
	SELECT 6, 3, 2, 6 UNION ALL
	SELECT 60, 45, 7, 15 UNION ALL
	SELECT 600, 448, 7, 15 UNION ALL
	SELECT 601, 450, 1, 3 UNION ALL
	SELECT 602, 450, 2, 4 UNION ALL
	SELECT 603, 450, 3, 14 UNION ALL
	SELECT 604, 450, 7, 15 UNION ALL
	SELECT 605, 452, 1, 1 UNION ALL
	SELECT 606, 452, 2, 4 UNION ALL
	SELECT 607, 452, 3, 14 UNION ALL
	SELECT 608, 452, 7, 15 UNION ALL
	SELECT 609, 454, 1, 2 UNION ALL
	SELECT 61, 46, 1, 2 UNION ALL
	SELECT 610, 454, 2, 4 UNION ALL
	SELECT 611, 454, 3, 14 UNION ALL
	SELECT 612, 454, 7, 15 UNION ALL
	SELECT 62, 46, 2, 4 UNION ALL
	SELECT 63, 46, 3, 14 UNION ALL
	SELECT 64, 46, 7, 15 UNION ALL
	SELECT 65, 47, 1, 2 UNION ALL
	SELECT 66, 47, 2, 4 UNION ALL
	SELECT 67, 47, 3, 14 UNION ALL
	SELECT 68, 47, 7, 15 UNION ALL
	SELECT 69, 48, 1, 2 UNION ALL
	SELECT 7, 3, 3, 14 UNION ALL
	SELECT 70, 48, 2, 4 UNION ALL
	SELECT 71, 48, 3, 14 UNION ALL
	SELECT 72, 48, 7, 15 UNION ALL
	SELECT 73, 49, 1, 1 UNION ALL
	SELECT 74, 49, 2, 4 UNION ALL
	SELECT 75, 49, 3, 14 UNION ALL
	SELECT 76, 49, 7, 15 UNION ALL
	SELECT 77, 50, 1, 1 UNION ALL
	SELECT 78, 50, 2, 5 UNION ALL
	SELECT 79, 50, 3, 14 UNION ALL
	SELECT 8, 3, 7, 16 UNION ALL
	SELECT 80, 50, 7, 15 UNION ALL
	SELECT 81, 51, 1, 2 UNION ALL
	SELECT 82, 51, 2, 4 UNION ALL
	SELECT 83, 51, 3, 14 UNION ALL
	SELECT 84, 51, 7, 15 UNION ALL
	SELECT 85, 52, 1, 2 UNION ALL
	SELECT 86, 52, 2, 4 UNION ALL
	SELECT 87, 52, 3, 14 UNION ALL
	SELECT 88, 52, 7, 15 UNION ALL
	SELECT 89, 53, 1, 2 UNION ALL
	SELECT 9, 11, 1, 1 UNION ALL
	SELECT 90, 53, 2, 4 UNION ALL
	SELECT 91, 53, 3, 14 UNION ALL
	SELECT 92, 53, 7, 15 UNION ALL
	SELECT 93, 54, 1, 2 UNION ALL
	SELECT 94, 54, 2, 4 UNION ALL
	SELECT 95, 54, 3, 14 UNION ALL
	SELECT 96, 54, 7, 15 UNION ALL
	SELECT 97, 55, 1, 2 UNION ALL
	SELECT 98, 55, 2, 4 UNION ALL
	SELECT 99, 55, 3, 14
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

SET IDENTITY_INSERT [dbo].[GrammarForms] ON
BEGIN TRANSACTION;
	INSERT INTO [dbo].[GrammarForms] ([Id], [FormId], [WordId], [Content]) 
	SELECT 1, 8, 1, N'Polska' UNION ALL
	SELECT 2, 9, 1, N'Polski' UNION ALL
	SELECT 3, 10, 1, N'Polsce' UNION ALL
	SELECT 4, 11, 1, N'Polskę' UNION ALL
	SELECT 5, 12, 1, N'z Polską' UNION ALL
	SELECT 6, 13, 1, N'Polsce' UNION ALL
	SELECT 7, 14, 1, N'Polsko' UNION ALL
	SELECT 8, 24, 1, N'do Polski' UNION ALL
	SELECT 9, 25, 1, N'w Polsce' UNION ALL
	SELECT 10, 8, 3, N'pies' UNION ALL
	SELECT 11, 9, 3, N'psa' UNION ALL
	SELECT 12, 10, 3, N'psu' UNION ALL
	SELECT 13, 11, 3, N'psa' UNION ALL
	SELECT 14, 12, 3, N'z psem' UNION ALL
	SELECT 15, 13, 3, N'psie' UNION ALL
	SELECT 16, 14, 3, N'psie' UNION ALL
	SELECT 17, 15, 3, N'psy' UNION ALL
	SELECT 18, 16, 3, N'psów' UNION ALL
	SELECT 19, 17, 3, N'psom' UNION ALL
	SELECT 20, 18, 3, N'psy' UNION ALL
	SELECT 21, 19, 3, N'z psami' UNION ALL
	SELECT 22, 20, 3, N'o psach' UNION ALL
	SELECT 23, 21, 3, N'psy' UNION ALL
	SELECT 24, 15, 11, N'Włochy' UNION ALL
	SELECT 25, 16, 11, N'Włoch' UNION ALL
	SELECT 26, 17, 11, N'Włochom' UNION ALL
	SELECT 27, 18, 11, N'Włochy' UNION ALL
	SELECT 28, 19, 11, N'z Włochami' UNION ALL
	SELECT 29, 20, 11, N'Włoszech' UNION ALL
	SELECT 30, 21, 11, N'Włochy' UNION ALL
	SELECT 31, 24, 11, N'do Włoch' UNION ALL
	SELECT 32, 25, 11, N'we Włoszech' UNION ALL
	SELECT 33, 8, 15, N'Hiszpania' UNION ALL
	SELECT 34, 9, 15, N'Hiszpanii' UNION ALL
	SELECT 35, 10, 15, N'Hiszpanii' UNION ALL
	SELECT 36, 11, 15, N'Hiszpanię' UNION ALL
	SELECT 37, 12, 15, N'z Hiszpanią' UNION ALL
	SELECT 38, 13, 15, N'Hiszpanii' UNION ALL
	SELECT 39, 14, 15, N'Hiszpanio' UNION ALL
	SELECT 40, 24, 15, N'do Hiszpanii' UNION ALL
	SELECT 41, 25, 15, N'w Hiszpanii' UNION ALL
	SELECT 42, 8, 19, N'Francja' UNION ALL
	SELECT 43, 9, 19, N'Francji' UNION ALL
	SELECT 44, 10, 19, N'Francji' UNION ALL
	SELECT 45, 11, 19, N'Francję' UNION ALL
	SELECT 46, 12, 19, N'z Francją' UNION ALL
	SELECT 47, 13, 19, N'Francji' UNION ALL
	SELECT 48, 14, 19, N'Francjo' UNION ALL
	SELECT 49, 24, 19, N'do Francji' UNION ALL
	SELECT 50, 25, 19, N'we Francji' UNION ALL
	SELECT 51, 15, 23, N'Niemcy' UNION ALL
	SELECT 52, 16, 23, N'Niemiec' UNION ALL
	SELECT 53, 17, 23, N'Niemcom' UNION ALL
	SELECT 54, 18, 23, N'Niemcy' UNION ALL
	SELECT 55, 19, 23, N'z Niemcami' UNION ALL
	SELECT 56, 20, 23, N'Niemczech' UNION ALL
	SELECT 57, 21, 23, N'Niemcy' UNION ALL
	SELECT 58, 24, 23, N'do Niemiec' UNION ALL
	SELECT 59, 25, 23, N'w Niemczech' UNION ALL
	SELECT 60, 8, 27, N'Anglia' UNION ALL
	SELECT 61, 9, 27, N'Anglii' UNION ALL
	SELECT 62, 10, 27, N'Anglii' UNION ALL
	SELECT 63, 11, 27, N'Anglię' UNION ALL
	SELECT 64, 12, 27, N'z Anglią' UNION ALL
	SELECT 65, 13, 27, N'Anglii' UNION ALL
	SELECT 66, 14, 27, N'Anglio' UNION ALL
	SELECT 67, 24, 27, N'do Anglii' UNION ALL
	SELECT 68, 25, 27, N'w Anglii' UNION ALL
	SELECT 69, 8, 31, N'Rosja' UNION ALL
	SELECT 70, 9, 31, N'Rosji' UNION ALL
	SELECT 71, 10, 31, N'Rosji' UNION ALL
	SELECT 72, 11, 31, N'Rosję' UNION ALL
	SELECT 73, 12, 31, N'z Rosją' UNION ALL
	SELECT 74, 13, 31, N'Rosji' UNION ALL
	SELECT 75, 14, 31, N'Rosjo' UNION ALL
	SELECT 76, 24, 31, N'do Rosji' UNION ALL
	SELECT 77, 25, 31, N'w Rosji' UNION ALL
	SELECT 78, 8, 35, N'Albania' UNION ALL
	SELECT 79, 9, 35, N'Albanii' UNION ALL
	SELECT 80, 10, 35, N'Albanii' UNION ALL
	SELECT 81, 11, 35, N'Albanię' UNION ALL
	SELECT 82, 12, 35, N'z Albanią' UNION ALL
	SELECT 83, 13, 35, N'Albanii' UNION ALL
	SELECT 84, 14, 35, N'Albanio' UNION ALL
	SELECT 85, 24, 35, N'do Albanii' UNION ALL
	SELECT 86, 25, 35, N'w Albanii' UNION ALL
	SELECT 87, 8, 40, N'Andora' UNION ALL
	SELECT 88, 9, 40, N'Andory' UNION ALL
	SELECT 89, 10, 40, N'Andorze' UNION ALL
	SELECT 90, 11, 40, N'Andorę' UNION ALL
	SELECT 91, 12, 40, N'z Andorą' UNION ALL
	SELECT 92, 13, 40, N'Andorze' UNION ALL
	SELECT 93, 14, 40, N'Andoro' UNION ALL
	SELECT 94, 24, 40, N'do Andory' UNION ALL
	SELECT 95, 25, 40, N'w Andorze' UNION ALL
	SELECT 96, 8, 41, N'Armenia' UNION ALL
	SELECT 97, 9, 41, N'Armenii' UNION ALL
	SELECT 98, 10, 41, N'Armenii' UNION ALL
	SELECT 99, 11, 41, N'Armenię' UNION ALL
	SELECT 100, 12, 41, N'z Armenią' UNION ALL
	SELECT 101, 13, 41, N'Armenii' UNION ALL
	SELECT 102, 14, 41, N'Armenio' UNION ALL
	SELECT 103, 24, 41, N'do Armenii' UNION ALL
	SELECT 104, 25, 41, N'w Armenii' UNION ALL
	SELECT 105, 8, 42, N'Austria' UNION ALL
	SELECT 106, 9, 42, N'Austrii' UNION ALL
	SELECT 107, 10, 42, N'Austrii' UNION ALL
	SELECT 108, 11, 42, N'Austrię' UNION ALL
	SELECT 109, 12, 42, N'z Austrią' UNION ALL
	SELECT 110, 13, 42, N'Austrii' UNION ALL
	SELECT 111, 14, 42, N'Austrio' UNION ALL
	SELECT 112, 24, 42, N'do Austrii' UNION ALL
	SELECT 113, 25, 42, N'w Austrii' UNION ALL
	SELECT 114, 8, 43, N'Azerbejdżan' UNION ALL
	SELECT 115, 9, 43, N'Azerbejdżanu' UNION ALL
	SELECT 116, 10, 43, N'Azerbejdżanowi' UNION ALL
	SELECT 117, 11, 43, N'Azerbejdżan' UNION ALL
	SELECT 118, 12, 43, N'z Azerbejdżanem' UNION ALL
	SELECT 119, 13, 43, N'Azerbejdżanie' UNION ALL
	SELECT 120, 14, 43, N'Azerbejdżanie' UNION ALL
	SELECT 121, 24, 43, N'do Azerbejdżanu' UNION ALL
	SELECT 122, 25, 43, N'w Azerbejdżanie' UNION ALL
	SELECT 123, 8, 44, N'Białoruś' UNION ALL
	SELECT 124, 9, 44, N'Białorusi' UNION ALL
	SELECT 125, 10, 44, N'Białorusi' UNION ALL
	SELECT 126, 11, 44, N'Białoruś' UNION ALL
	SELECT 127, 12, 44, N'z Białorusią' UNION ALL
	SELECT 128, 13, 44, N'Białorusi' UNION ALL
	SELECT 129, 14, 44, N'Białoruś' UNION ALL
	SELECT 130, 24, 44, N'na Białoruś' UNION ALL
	SELECT 131, 25, 44, N'na Białorusi' UNION ALL
	SELECT 132, 8, 45, N'Belgia' UNION ALL
	SELECT 133, 9, 45, N'Belgii' UNION ALL
	SELECT 134, 10, 45, N'Belgii' UNION ALL
	SELECT 135, 11, 45, N'Belgię' UNION ALL
	SELECT 136, 12, 45, N'z Belgią' UNION ALL
	SELECT 137, 13, 45, N'Belgii' UNION ALL
	SELECT 138, 14, 45, N'Belgio' UNION ALL
	SELECT 139, 24, 45, N'do Belgii' UNION ALL
	SELECT 140, 25, 45, N'w Belgii' UNION ALL
	SELECT 141, 8, 46, N'Bośnia i Hercegowina' UNION ALL
	SELECT 142, 9, 46, N'Bośni i Hercegowiny' UNION ALL
	SELECT 143, 10, 46, N'Bośni i Hercegowinie' UNION ALL
	SELECT 144, 11, 46, N'Bośnię i Hercegowinę' UNION ALL
	SELECT 145, 12, 46, N'z Bośnią i Hercegowiną' UNION ALL
	SELECT 146, 13, 46, N'Bośni i Hercegowinie' UNION ALL
	SELECT 147, 14, 46, N'Bośnio i Hercegowino' UNION ALL
	SELECT 148, 24, 46, N'do Bośni i Hercegowiny' UNION ALL
	SELECT 149, 25, 46, N'w Bośni i Hercegowinie' UNION ALL
	SELECT 150, 8, 47, N'Bułgaria' UNION ALL
	SELECT 151, 9, 47, N'Bułgarii' UNION ALL
	SELECT 152, 10, 47, N'Bułgarii' UNION ALL
	SELECT 153, 11, 47, N'Bułgarię' UNION ALL
	SELECT 154, 12, 47, N'z Bułgarią' UNION ALL
	SELECT 155, 13, 47, N'Bułgarii' UNION ALL
	SELECT 156, 14, 47, N'Bułgario' UNION ALL
	SELECT 157, 24, 47, N'do Bułgarii' UNION ALL
	SELECT 158, 25, 47, N'w Bułgarii' UNION ALL
	SELECT 159, 8, 48, N'Chorwacja' UNION ALL
	SELECT 160, 9, 48, N'Chorwacji' UNION ALL
	SELECT 161, 10, 48, N'Chorwacji' UNION ALL
	SELECT 162, 11, 48, N'Chorwację' UNION ALL
	SELECT 163, 12, 48, N'z Chorwacją' UNION ALL
	SELECT 164, 13, 48, N'Chorwacji' UNION ALL
	SELECT 165, 14, 48, N'Chorwacjo' UNION ALL
	SELECT 166, 24, 48, N'do Chorwacji' UNION ALL
	SELECT 167, 25, 48, N'w Chorwacji' UNION ALL
	SELECT 168, 8, 49, N'Cypr' UNION ALL
	SELECT 169, 9, 49, N'Cypru' UNION ALL
	SELECT 170, 10, 49, N'Cyprowi' UNION ALL
	SELECT 171, 11, 49, N'Cypr' UNION ALL
	SELECT 172, 12, 49, N'z Cyprem' UNION ALL
	SELECT 173, 13, 49, N'Cyprze' UNION ALL
	SELECT 174, 14, 49, N'Cyprze' UNION ALL
	SELECT 175, 24, 49, N'na Cypr' UNION ALL
	SELECT 176, 25, 49, N'na Cyprze' UNION ALL
	SELECT 177, 8, 50, N'Czechy' UNION ALL
	SELECT 178, 9, 50, N'Czech' UNION ALL
	SELECT 179, 10, 50, N'Czechom' UNION ALL
	SELECT 180, 11, 50, N'Czechy' UNION ALL
	SELECT 181, 12, 50, N'z Czechami' UNION ALL
	SELECT 182, 13, 50, N'Czechach' UNION ALL
	SELECT 183, 14, 50, N'Czechy' UNION ALL
	SELECT 184, 24, 50, N'do Czech' UNION ALL
	SELECT 185, 25, 50, N'w Czechach' UNION ALL
	SELECT 186, 8, 51, N'Dania' UNION ALL
	SELECT 187, 9, 51, N'Danii' UNION ALL
	SELECT 188, 10, 51, N'Danii' UNION ALL
	SELECT 189, 11, 51, N'Danię' UNION ALL
	SELECT 190, 12, 51, N'z Danią' UNION ALL
	SELECT 191, 13, 51, N'Danii' UNION ALL
	SELECT 192, 14, 51, N'Danio' UNION ALL
	SELECT 193, 24, 51, N'do Danii' UNION ALL
	SELECT 194, 25, 51, N'w Danii' UNION ALL
	SELECT 195, 8, 52, N'Estonia' UNION ALL
	SELECT 196, 9, 52, N'Estonii' UNION ALL
	SELECT 197, 10, 52, N'Estonii' UNION ALL
	SELECT 198, 11, 52, N'Estonię' UNION ALL
	SELECT 199, 12, 52, N'z Estonią' UNION ALL
	SELECT 200, 13, 52, N'Estonii' UNION ALL
	SELECT 201, 14, 52, N'Estonio' UNION ALL
	SELECT 202, 24, 52, N'do Estonii' UNION ALL
	SELECT 203, 25, 52, N'w Estonii' UNION ALL
	SELECT 204, 8, 53, N'Finlandia' UNION ALL
	SELECT 205, 9, 53, N'Finlandii' UNION ALL
	SELECT 206, 10, 53, N'Finlandii' UNION ALL
	SELECT 207, 11, 53, N'Finlandię' UNION ALL
	SELECT 208, 12, 53, N'z Finlandią' UNION ALL
	SELECT 209, 13, 53, N'Finlandii' UNION ALL
	SELECT 210, 14, 53, N'Finlandio' UNION ALL
	SELECT 211, 24, 53, N'do Finlandii' UNION ALL
	SELECT 212, 25, 53, N'w Finlandii' UNION ALL
	SELECT 213, 8, 54, N'Gruzja' UNION ALL
	SELECT 214, 9, 54, N'Gruzji' UNION ALL
	SELECT 215, 10, 54, N'Gruzji' UNION ALL
	SELECT 216, 11, 54, N'Gruzję' UNION ALL
	SELECT 217, 12, 54, N'z Gruzją' UNION ALL
	SELECT 218, 13, 54, N'Gruzji' UNION ALL
	SELECT 219, 14, 54, N'Gruzjo' UNION ALL
	SELECT 220, 24, 54, N'do Gruzji' UNION ALL
	SELECT 221, 25, 54, N'w Gruzji' UNION ALL
	SELECT 222, 8, 55, N'Grecja' UNION ALL
	SELECT 223, 9, 55, N'Grecji' UNION ALL
	SELECT 224, 10, 55, N'Grecji' UNION ALL
	SELECT 225, 11, 55, N'Grecję' UNION ALL
	SELECT 226, 12, 55, N'z Grecją' UNION ALL
	SELECT 227, 13, 55, N'Grecji' UNION ALL
	SELECT 228, 14, 55, N'Grecjo' UNION ALL
	SELECT 229, 24, 55, N'do Grecji' UNION ALL
	SELECT 230, 25, 55, N'w Grecji' UNION ALL
	SELECT 231, 8, 56, N'Węgry' UNION ALL
	SELECT 232, 9, 56, N'Węgier' UNION ALL
	SELECT 233, 10, 56, N'Węgrom' UNION ALL
	SELECT 234, 11, 56, N'Węgry' UNION ALL
	SELECT 235, 12, 56, N'z Węgrami' UNION ALL
	SELECT 236, 13, 56, N'Węgrach' UNION ALL
	SELECT 237, 14, 56, N'Węgry' UNION ALL
	SELECT 238, 24, 56, N'na Węgry' UNION ALL
	SELECT 239, 25, 56, N'na Węgrzech' UNION ALL
	SELECT 240, 8, 57, N'Islandia' UNION ALL
	SELECT 241, 9, 57, N'Islandii' UNION ALL
	SELECT 242, 10, 57, N'Islandii' UNION ALL
	SELECT 243, 11, 57, N'Islandię' UNION ALL
	SELECT 244, 12, 57, N'z Islandią' UNION ALL
	SELECT 245, 13, 57, N'Islandii' UNION ALL
	SELECT 246, 14, 57, N'Islandio' UNION ALL
	SELECT 247, 24, 57, N'do Islandii' UNION ALL
	SELECT 248, 25, 57, N'w Islandii' UNION ALL
	SELECT 249, 8, 58, N'Irlandia' UNION ALL
	SELECT 250, 9, 58, N'Irlandii' UNION ALL
	SELECT 251, 10, 58, N'Irlandii' UNION ALL
	SELECT 252, 11, 58, N'Irlandię' UNION ALL
	SELECT 253, 12, 58, N'z Irlandią' UNION ALL
	SELECT 254, 13, 58, N'Irlandii' UNION ALL
	SELECT 255, 14, 58, N'Irlandio' UNION ALL
	SELECT 256, 24, 58, N'do Irlandii' UNION ALL
	SELECT 257, 25, 58, N'w Irlandii' UNION ALL
	SELECT 258, 8, 59, N'Kazachstan' UNION ALL
	SELECT 259, 9, 59, N'Kazachstanu' UNION ALL
	SELECT 260, 10, 59, N'Kazachstanowi' UNION ALL
	SELECT 261, 11, 59, N'Kazachstan' UNION ALL
	SELECT 262, 12, 59, N'z Kazachstanem' UNION ALL
	SELECT 263, 13, 59, N'Kazachstanie' UNION ALL
	SELECT 264, 14, 59, N'Kazachstanie' UNION ALL
	SELECT 265, 24, 59, N'do Kazachstanu' UNION ALL
	SELECT 266, 25, 59, N'w Kazachstanie' UNION ALL
	SELECT 267, 8, 60, N'Łotwa' UNION ALL
	SELECT 268, 9, 60, N'Łotwy' UNION ALL
	SELECT 269, 10, 60, N'Łotwie' UNION ALL
	SELECT 270, 11, 60, N'Łotwę' UNION ALL
	SELECT 271, 12, 60, N'z Łotwą' UNION ALL
	SELECT 272, 13, 60, N'Łotwie' UNION ALL
	SELECT 273, 14, 60, N'Łotwo' UNION ALL
	SELECT 274, 24, 60, N'na Łotwę' UNION ALL
	SELECT 275, 25, 60, N'na Łotwie' UNION ALL
	SELECT 276, 8, 61, N'Liechtenstein' UNION ALL
	SELECT 277, 9, 61, N'Liechtensteinu' UNION ALL
	SELECT 278, 10, 61, N'Liechtensteinowi' UNION ALL
	SELECT 279, 11, 61, N'Liechtenstein' UNION ALL
	SELECT 280, 12, 61, N'z Liechtensteinem' UNION ALL
	SELECT 281, 13, 61, N'Liechtensteinie' UNION ALL
	SELECT 282, 14, 61, N'Liechtensteinie' UNION ALL
	SELECT 283, 24, 61, N'do Liechtensteinu' UNION ALL
	SELECT 284, 25, 61, N'w Liechtensteinie' UNION ALL
	SELECT 285, 8, 62, N'Litwa' UNION ALL
	SELECT 286, 9, 62, N'Litwy' UNION ALL
	SELECT 287, 10, 62, N'Litwie' UNION ALL
	SELECT 288, 11, 62, N'Litwę' UNION ALL
	SELECT 289, 12, 62, N'z Litwą' UNION ALL
	SELECT 290, 13, 62, N'Litwie' UNION ALL
	SELECT 291, 14, 62, N'Litwo' UNION ALL
	SELECT 292, 24, 62, N'na Litwę' UNION ALL
	SELECT 293, 25, 62, N'na Litwie' UNION ALL
	SELECT 294, 8, 63, N'Luksemburg' UNION ALL
	SELECT 295, 9, 63, N'Luksemburga' UNION ALL
	SELECT 296, 10, 63, N'Luksemburgowi' UNION ALL
	SELECT 297, 11, 63, N'Luksemburg' UNION ALL
	SELECT 298, 12, 63, N'z Luksemburgiem' UNION ALL
	SELECT 299, 13, 63, N'Luksemburgu' UNION ALL
	SELECT 300, 14, 63, N'Luksemburgu' UNION ALL
	SELECT 301, 24, 63, N'do Luksemburga' UNION ALL
	SELECT 302, 25, 63, N'w Luksemburgu' UNION ALL
	SELECT 303, 8, 64, N'Macedonia' UNION ALL
	SELECT 304, 9, 64, N'Macedonii' UNION ALL
	SELECT 305, 10, 64, N'Macedonii' UNION ALL
	SELECT 306, 11, 64, N'Macedonię' UNION ALL
	SELECT 307, 12, 64, N'z Macedonią' UNION ALL
	SELECT 308, 13, 64, N'Macedonii' UNION ALL
	SELECT 309, 14, 64, N'Macedonio' UNION ALL
	SELECT 310, 24, 64, N'do Macedonii' UNION ALL
	SELECT 311, 25, 64, N'w Macedonii' UNION ALL
	SELECT 312, 8, 65, N'Malta' UNION ALL
	SELECT 313, 9, 65, N'Malty' UNION ALL
	SELECT 314, 10, 65, N'Malcie' UNION ALL
	SELECT 315, 11, 65, N'Maltę' UNION ALL
	SELECT 316, 12, 65, N'z Maltą' UNION ALL
	SELECT 317, 13, 65, N'Malcie' UNION ALL
	SELECT 318, 14, 65, N'Malto' UNION ALL
	SELECT 319, 24, 65, N'na Maltę' UNION ALL
	SELECT 320, 25, 65, N'na Malcie' UNION ALL
	SELECT 321, 8, 66, N'Mołdawia' UNION ALL
	SELECT 322, 9, 66, N'Mołdawii' UNION ALL
	SELECT 323, 10, 66, N'Mołdawii' UNION ALL
	SELECT 324, 11, 66, N'Mołdawię' UNION ALL
	SELECT 325, 12, 66, N'z Mołdawią' UNION ALL
	SELECT 326, 13, 66, N'Mołdawii' UNION ALL
	SELECT 327, 14, 66, N'Mołdawio' UNION ALL
	SELECT 328, 24, 66, N'do Mołdawii' UNION ALL
	SELECT 329, 25, 66, N'w Mołdawii' UNION ALL
	SELECT 330, 8, 67, N'Monako' UNION ALL
	SELECT 331, 9, 67, N'Monako' UNION ALL
	SELECT 332, 10, 67, N'Monako' UNION ALL
	SELECT 333, 11, 67, N'Monako' UNION ALL
	SELECT 334, 12, 67, N'z Monako' UNION ALL
	SELECT 335, 13, 67, N'Monako' UNION ALL
	SELECT 336, 14, 67, N'Monako' UNION ALL
	SELECT 337, 24, 67, N'do Monako' UNION ALL
	SELECT 338, 25, 67, N'w Monako' UNION ALL
	SELECT 339, 8, 68, N'Czarnogóra' UNION ALL
	SELECT 340, 9, 68, N'Czarnogóry' UNION ALL
	SELECT 341, 10, 68, N'Czarnogórze' UNION ALL
	SELECT 342, 11, 68, N'Czarnogórę' UNION ALL
	SELECT 343, 12, 68, N'z Czarnogórą' UNION ALL
	SELECT 344, 13, 68, N'Czarnogórze' UNION ALL
	SELECT 345, 14, 68, N'Czarnogóro' UNION ALL
	SELECT 346, 24, 68, N'do Czarnogóry' UNION ALL
	SELECT 347, 25, 68, N'w Czarnogórze' UNION ALL
	SELECT 348, 8, 69, N'Holandia' UNION ALL
	SELECT 349, 9, 69, N'Holandii' UNION ALL
	SELECT 350, 10, 69, N'Holandii' UNION ALL
	SELECT 351, 11, 69, N'Holandię' UNION ALL
	SELECT 352, 12, 69, N'z Holandią' UNION ALL
	SELECT 353, 13, 69, N'Holandii' UNION ALL
	SELECT 354, 14, 69, N'Holandio' UNION ALL
	SELECT 355, 24, 69, N'do Holandii' UNION ALL
	SELECT 356, 25, 69, N'w Holandii' UNION ALL
	SELECT 357, 8, 70, N'Norwegia' UNION ALL
	SELECT 358, 9, 70, N'Norwegii' UNION ALL
	SELECT 359, 10, 70, N'Norwegii' UNION ALL
	SELECT 360, 11, 70, N'Norwegię' UNION ALL
	SELECT 361, 12, 70, N'z Norwegią' UNION ALL
	SELECT 362, 13, 70, N'Norwegii' UNION ALL
	SELECT 363, 14, 70, N'Norwegio' UNION ALL
	SELECT 364, 24, 70, N'do Norwegii' UNION ALL
	SELECT 365, 25, 70, N'w Norwegii' UNION ALL
	SELECT 366, 8, 71, N'Portugalia' UNION ALL
	SELECT 367, 9, 71, N'Portugalii' UNION ALL
	SELECT 368, 10, 71, N'Portugalii' UNION ALL
	SELECT 369, 11, 71, N'Portugalię' UNION ALL
	SELECT 370, 12, 71, N'z Portugalią' UNION ALL
	SELECT 371, 13, 71, N'Portugalii' UNION ALL
	SELECT 372, 14, 71, N'Portugalio' UNION ALL
	SELECT 373, 24, 71, N'do Portugalii' UNION ALL
	SELECT 374, 25, 71, N'w Portugalii' UNION ALL
	SELECT 375, 8, 72, N'Rumunia' UNION ALL
	SELECT 376, 9, 72, N'Rumunii' UNION ALL
	SELECT 377, 10, 72, N'Rumunii' UNION ALL
	SELECT 378, 11, 72, N'Rumunię' UNION ALL
	SELECT 379, 12, 72, N'z Rumunią' UNION ALL
	SELECT 380, 13, 72, N'Rumunii' UNION ALL
	SELECT 381, 14, 72, N'Rumunio' UNION ALL
	SELECT 382, 24, 72, N'do Rumunii' UNION ALL
	SELECT 383, 25, 72, N'w Rumunii' UNION ALL
	SELECT 384, 8, 73, N'San Marino' UNION ALL
	SELECT 385, 9, 73, N'San Marino' UNION ALL
	SELECT 386, 10, 73, N'San Marino' UNION ALL
	SELECT 387, 11, 73, N'San Marino' UNION ALL
	SELECT 388, 12, 73, N'z San Marino' UNION ALL
	SELECT 389, 13, 73, N'San Marino' UNION ALL
	SELECT 390, 14, 73, N'San Marino' UNION ALL
	SELECT 391, 24, 73, N'do San Marino' UNION ALL
	SELECT 392, 25, 73, N'w San Marino' UNION ALL
	SELECT 393, 8, 74, N'Serbia' UNION ALL
	SELECT 394, 9, 74, N'Serbii' UNION ALL
	SELECT 395, 10, 74, N'Serbii' UNION ALL
	SELECT 396, 11, 74, N'Serbię' UNION ALL
	SELECT 397, 12, 74, N'z Serbią' UNION ALL
	SELECT 398, 13, 74, N'Serbii' UNION ALL
	SELECT 399, 14, 74, N'Serbio' UNION ALL
	SELECT 400, 24, 74, N'do Serbii' UNION ALL
	SELECT 401, 25, 74, N'w Serbii' UNION ALL
	SELECT 402, 8, 75, N'Słowacja' UNION ALL
	SELECT 403, 9, 75, N'Słowacji' UNION ALL
	SELECT 404, 10, 75, N'Słowacji' UNION ALL
	SELECT 405, 11, 75, N'Słowację' UNION ALL
	SELECT 406, 12, 75, N'z Słowacją' UNION ALL
	SELECT 407, 13, 75, N'Słowacji' UNION ALL
	SELECT 408, 14, 75, N'Słowacjo' UNION ALL
	SELECT 409, 24, 75, N'na Słowację' UNION ALL
	SELECT 410, 25, 75, N'na Słowację' UNION ALL
	SELECT 411, 8, 76, N'Słowenia' UNION ALL
	SELECT 412, 9, 76, N'Słowenii' UNION ALL
	SELECT 413, 10, 76, N'Słowenii' UNION ALL
	SELECT 414, 11, 76, N'Słowenię' UNION ALL
	SELECT 415, 12, 76, N'z Słowenią' UNION ALL
	SELECT 416, 13, 76, N'Słowenii' UNION ALL
	SELECT 417, 14, 76, N'Słowenio' UNION ALL
	SELECT 418, 24, 76, N'do Słowenii' UNION ALL
	SELECT 419, 25, 76, N'w Słowenii' UNION ALL
	SELECT 420, 8, 77, N'Szwecja' UNION ALL
	SELECT 421, 9, 77, N'Szwecji' UNION ALL
	SELECT 422, 10, 77, N'Szwecji' UNION ALL
	SELECT 423, 11, 77, N'Szwecję' UNION ALL
	SELECT 424, 12, 77, N'z Szwecją' UNION ALL
	SELECT 425, 13, 77, N'Szwecji' UNION ALL
	SELECT 426, 14, 77, N'Szwecjo' UNION ALL
	SELECT 427, 24, 77, N'do Szwecji' UNION ALL
	SELECT 428, 25, 77, N'w Szwecji' UNION ALL
	SELECT 429, 8, 78, N'Szwajcaria' UNION ALL
	SELECT 430, 9, 78, N'Szwajcarii' UNION ALL
	SELECT 431, 10, 78, N'Szwajcarii' UNION ALL
	SELECT 432, 11, 78, N'Szwajcarię' UNION ALL
	SELECT 433, 12, 78, N'z Szwajcarią' UNION ALL
	SELECT 434, 13, 78, N'Szwajcarii' UNION ALL
	SELECT 435, 14, 78, N'Szwajcario' UNION ALL
	SELECT 436, 24, 78, N'do Szwajcarii' UNION ALL
	SELECT 437, 25, 78, N'w Szwajcarii' UNION ALL
	SELECT 438, 8, 79, N'Turcja' UNION ALL
	SELECT 439, 9, 79, N'Turcji' UNION ALL
	SELECT 440, 10, 79, N'Turcji' UNION ALL
	SELECT 441, 11, 79, N'Turcję' UNION ALL
	SELECT 442, 12, 79, N'z Turcją' UNION ALL
	SELECT 443, 13, 79, N'Turcji' UNION ALL
	SELECT 444, 14, 79, N'Turcjo' UNION ALL
	SELECT 445, 24, 79, N'do Turcji' UNION ALL
	SELECT 446, 25, 79, N'w Turcji' UNION ALL
	SELECT 447, 8, 80, N'Ukraina' UNION ALL
	SELECT 448, 9, 80, N'Ukrainy' UNION ALL
	SELECT 449, 10, 80, N'Ukrainie' UNION ALL
	SELECT 450, 11, 80, N'Ukrainę' UNION ALL
	SELECT 451, 12, 80, N'z Ukrainą' UNION ALL
	SELECT 452, 13, 80, N'Ukrainie' UNION ALL
	SELECT 453, 14, 80, N'Ukraino' UNION ALL
	SELECT 454, 24, 80, N'na Ukrainę' UNION ALL
	SELECT 455, 25, 80, N'na Ukrainie' UNION ALL
	SELECT 456, 8, 81, N'Wielka Brytania' UNION ALL
	SELECT 457, 9, 81, N'Wielkiej Brytanii' UNION ALL
	SELECT 458, 10, 81, N'Wielkiej Brytanii' UNION ALL
	SELECT 459, 11, 81, N'Wielką Brytanię' UNION ALL
	SELECT 460, 12, 81, N'z Wielką Brytanią' UNION ALL
	SELECT 461, 13, 81, N'Wielkiej Brytanii' UNION ALL
	SELECT 462, 14, 81, N'Wielka Brytanio' UNION ALL
	SELECT 463, 24, 81, N'do Wielkiej Brytanii' UNION ALL
	SELECT 464, 25, 81, N'w Wielkiej Brytanii' UNION ALL
	SELECT 465, 8, 82, N'Watykan' UNION ALL
	SELECT 466, 9, 82, N'Watykanu' UNION ALL
	SELECT 467, 10, 82, N'Watykanowi' UNION ALL
	SELECT 468, 11, 82, N'Watykan' UNION ALL
	SELECT 469, 12, 82, N'z Watykanem' UNION ALL
	SELECT 470, 13, 82, N'Watykanie' UNION ALL
	SELECT 471, 14, 82, N'Watykanie' UNION ALL
	SELECT 472, 24, 82, N'do Watykanu' UNION ALL
	SELECT 473, 25, 82, N'w Watykanie' UNION ALL
	SELECT 474, 8, 83, N'Szkocja' UNION ALL
	SELECT 475, 9, 83, N'Szkocji' UNION ALL
	SELECT 476, 10, 83, N'Szkocji' UNION ALL
	SELECT 477, 11, 83, N'Szkocję' UNION ALL
	SELECT 478, 12, 83, N'z Szkocją' UNION ALL
	SELECT 479, 13, 83, N'Szkocji' UNION ALL
	SELECT 480, 14, 83, N'Szkocjo' UNION ALL
	SELECT 481, 24, 83, N'do Szkocji' UNION ALL
	SELECT 482, 25, 83, N'w Szkocji' UNION ALL
	SELECT 483, 8, 219, N'Brazylia' UNION ALL
	SELECT 484, 9, 219, N'Brazylii' UNION ALL
	SELECT 485, 10, 219, N'Brazylii' UNION ALL
	SELECT 486, 11, 219, N'Brazylię' UNION ALL
	SELECT 487, 12, 219, N'z Brazylią' UNION ALL
	SELECT 488, 13, 219, N'Brazylii' UNION ALL
	SELECT 489, 14, 219, N'Brazylio' UNION ALL
	SELECT 490, 24, 219, N'do Brazylii' UNION ALL
	SELECT 491, 25, 219, N'w Brazylii' UNION ALL
	SELECT 492, 8, 243, N'Kolumbia' UNION ALL
	SELECT 493, 9, 243, N'Kolumbii' UNION ALL
	SELECT 494, 10, 243, N'Kolumbii' UNION ALL
	SELECT 495, 11, 243, N'Kolumbię' UNION ALL
	SELECT 496, 12, 243, N'z Kolumbią' UNION ALL
	SELECT 497, 13, 243, N'Kolumbii' UNION ALL
	SELECT 498, 14, 243, N'Kolumbio' UNION ALL
	SELECT 499, 24, 243, N'do Kolumbii' UNION ALL
	SELECT 500, 25, 243, N'w Kolumbii' UNION ALL
	SELECT 501, 8, 247, N'Chile' UNION ALL
	SELECT 502, 9, 247, N'Chile' UNION ALL
	SELECT 503, 10, 247, N'Chile' UNION ALL
	SELECT 504, 11, 247, N'Chile' UNION ALL
	SELECT 505, 12, 247, N'z Chile' UNION ALL
	SELECT 506, 13, 247, N'Chile' UNION ALL
	SELECT 507, 14, 247, N'Chile' UNION ALL
	SELECT 508, 24, 247, N'do Chile' UNION ALL
	SELECT 509, 25, 247, N'w Chile' UNION ALL
	SELECT 510, 8, 251, N'Boliwia' UNION ALL
	SELECT 511, 9, 251, N'Boliwii' UNION ALL
	SELECT 512, 10, 251, N'Boliwii' UNION ALL
	SELECT 513, 11, 251, N'Boliwię' UNION ALL
	SELECT 514, 12, 251, N'z Boliwią' UNION ALL
	SELECT 515, 13, 251, N'Boliwii' UNION ALL
	SELECT 516, 14, 251, N'Boliwio' UNION ALL
	SELECT 517, 24, 251, N'do Boliwii' UNION ALL
	SELECT 518, 25, 251, N'w Boliwii' UNION ALL
	SELECT 519, 8, 255, N'Peru' UNION ALL
	SELECT 520, 9, 255, N'Peru' UNION ALL
	SELECT 521, 10, 255, N'Peru' UNION ALL
	SELECT 522, 11, 255, N'Peru' UNION ALL
	SELECT 523, 12, 255, N'z Peru' UNION ALL
	SELECT 524, 13, 255, N'Peru' UNION ALL
	SELECT 525, 14, 255, N'Peru' UNION ALL
	SELECT 526, 24, 255, N'do Peru' UNION ALL
	SELECT 527, 25, 255, N'w Peru' UNION ALL
	SELECT 528, 8, 261, N'Japonia' UNION ALL
	SELECT 529, 9, 261, N'Japonii' UNION ALL
	SELECT 530, 10, 261, N'Japonii' UNION ALL
	SELECT 531, 11, 261, N'Japonię' UNION ALL
	SELECT 532, 12, 261, N'z Japonią' UNION ALL
	SELECT 533, 13, 261, N'Japonii' UNION ALL
	SELECT 534, 14, 261, N'Japonio' UNION ALL
	SELECT 535, 24, 261, N'do Japonii' UNION ALL
	SELECT 536, 25, 261, N'w Japonii' UNION ALL
	SELECT 537, 8, 287, N'Belize' UNION ALL
	SELECT 538, 9, 287, N'Belize' UNION ALL
	SELECT 539, 10, 287, N'Belize' UNION ALL
	SELECT 540, 11, 287, N'Belize' UNION ALL
	SELECT 541, 12, 287, N'z Belize' UNION ALL
	SELECT 542, 13, 287, N'Belize' UNION ALL
	SELECT 543, 14, 287, N'Belize' UNION ALL
	SELECT 544, 24, 287, N'do Belize' UNION ALL
	SELECT 545, 25, 287, N'w Belize' UNION ALL
	SELECT 546, 8, 288, N'Tajlandia' UNION ALL
	SELECT 547, 9, 288, N'Tajlandii' UNION ALL
	SELECT 548, 10, 288, N'Tajlandii' UNION ALL
	SELECT 549, 11, 288, N'Tajlandię' UNION ALL
	SELECT 550, 12, 288, N'z Tajlandią' UNION ALL
	SELECT 551, 13, 288, N'Tajlandii' UNION ALL
	SELECT 552, 14, 288, N'Tajlandio' UNION ALL
	SELECT 553, 24, 288, N'do Tajlandii' UNION ALL
	SELECT 554, 25, 288, N'w Tajlandii' UNION ALL
	SELECT 555, 8, 294, N'Jordania' UNION ALL
	SELECT 556, 9, 294, N'Jordanii' UNION ALL
	SELECT 557, 10, 294, N'Jordanii' UNION ALL
	SELECT 558, 11, 294, N'Jordanię' UNION ALL
	SELECT 559, 12, 294, N'z Jordanią' UNION ALL
	SELECT 560, 13, 294, N'Jordanii' UNION ALL
	SELECT 561, 14, 294, N'Jordanio' UNION ALL
	SELECT 562, 24, 294, N'do Jordanii' UNION ALL
	SELECT 563, 25, 294, N'w Jordanii' UNION ALL
	SELECT 564, 8, 296, N'Syria' UNION ALL
	SELECT 565, 9, 296, N'Syrii' UNION ALL
	SELECT 566, 10, 296, N'Syrii' UNION ALL
	SELECT 567, 11, 296, N'Syrię' UNION ALL
	SELECT 568, 12, 296, N'z Syrią' UNION ALL
	SELECT 569, 13, 296, N'Syrii' UNION ALL
	SELECT 570, 14, 296, N'Syrio' UNION ALL
	SELECT 571, 24, 296, N'do Syrii' UNION ALL
	SELECT 572, 25, 296, N'w Syrii' UNION ALL
	SELECT 573, 8, 311, N'RPA' UNION ALL
	SELECT 574, 9, 311, N'RPA' UNION ALL
	SELECT 575, 10, 311, N'RPA' UNION ALL
	SELECT 576, 11, 311, N'RPA' UNION ALL
	SELECT 577, 12, 311, N'z RPA' UNION ALL
	SELECT 578, 13, 311, N'RPA' UNION ALL
	SELECT 579, 14, 311, N'RPA' UNION ALL
	SELECT 580, 24, 311, N'do RPA' UNION ALL
	SELECT 581, 25, 311, N'w RPA' UNION ALL
	SELECT 582, 8, 314, N'Kenia' UNION ALL
	SELECT 583, 9, 314, N'Kenii' UNION ALL
	SELECT 584, 10, 314, N'Kenii' UNION ALL
	SELECT 585, 11, 314, N'Kenię' UNION ALL
	SELECT 586, 12, 314, N'z Kenią' UNION ALL
	SELECT 587, 13, 314, N'Kenii' UNION ALL
	SELECT 588, 14, 314, N'Kenio' UNION ALL
	SELECT 589, 24, 314, N'do Kenii' UNION ALL
	SELECT 590, 25, 314, N'w Kenii' UNION ALL
	SELECT 591, 8, 317, N'Nigeria' UNION ALL
	SELECT 592, 9, 317, N'Nigerii' UNION ALL
	SELECT 593, 10, 317, N'Nigerii' UNION ALL
	SELECT 594, 11, 317, N'Nigerię' UNION ALL
	SELECT 595, 12, 317, N'z Nigerią' UNION ALL
	SELECT 596, 13, 317, N'Nigerii' UNION ALL
	SELECT 597, 14, 317, N'Nigerio' UNION ALL
	SELECT 598, 24, 317, N'do Nigerii' UNION ALL
	SELECT 599, 25, 317, N'w Nigerii' UNION ALL
	SELECT 600, 8, 319, N'Algieria' UNION ALL
	SELECT 601, 9, 319, N'Algierii' UNION ALL
	SELECT 602, 10, 319, N'Algierii' UNION ALL
	SELECT 603, 11, 319, N'Algierię' UNION ALL
	SELECT 604, 12, 319, N'z Algierią' UNION ALL
	SELECT 605, 13, 319, N'Algierii' UNION ALL
	SELECT 606, 14, 319, N'Algierio' UNION ALL
	SELECT 607, 24, 319, N'do Algierii' UNION ALL
	SELECT 608, 25, 319, N'w Algierii' UNION ALL
	SELECT 609, 8, 321, N'Grenlandia' UNION ALL
	SELECT 610, 9, 321, N'Grenlandii' UNION ALL
	SELECT 611, 10, 321, N'Grenlandii' UNION ALL
	SELECT 612, 11, 321, N'Grenlandię' UNION ALL
	SELECT 613, 12, 321, N'z Grenlandią' UNION ALL
	SELECT 614, 13, 321, N'Grenlandii' UNION ALL
	SELECT 615, 14, 321, N'Grenlandio' UNION ALL
	SELECT 616, 24, 321, N'na Grenlandię' UNION ALL
	SELECT 617, 25, 321, N'na Grenlandii' UNION ALL
	SELECT 618, 8, 322, N'Tanzania' UNION ALL
	SELECT 619, 9, 322, N'Tanzanii' UNION ALL
	SELECT 620, 10, 322, N'Tanzanii' UNION ALL
	SELECT 621, 11, 322, N'Tanzanię' UNION ALL
	SELECT 622, 12, 322, N'z Tanzanią' UNION ALL
	SELECT 623, 13, 322, N'Tanzanii' UNION ALL
	SELECT 624, 14, 322, N'Tanzanio' UNION ALL
	SELECT 625, 24, 322, N'do Tanzanii' UNION ALL
	SELECT 626, 25, 322, N'w Tanzanii' UNION ALL
	SELECT 627, 8, 323, N'Somalia' UNION ALL
	SELECT 628, 9, 323, N'Somalii' UNION ALL
	SELECT 629, 10, 323, N'Somalii' UNION ALL
	SELECT 630, 11, 323, N'Somalię' UNION ALL
	SELECT 631, 12, 323, N'z Somalią' UNION ALL
	SELECT 632, 13, 323, N'Somalii' UNION ALL
	SELECT 633, 14, 323, N'Somalio' UNION ALL
	SELECT 634, 24, 323, N'do Somalii' UNION ALL
	SELECT 635, 25, 323, N'w Somalii' UNION ALL
	SELECT 636, 8, 324, N'Gambia' UNION ALL
	SELECT 637, 9, 324, N'Gambii' UNION ALL
	SELECT 638, 10, 324, N'Gambii' UNION ALL
	SELECT 639, 11, 324, N'Gambię' UNION ALL
	SELECT 640, 12, 324, N'z Gambią' UNION ALL
	SELECT 641, 13, 324, N'Gambii' UNION ALL
	SELECT 642, 14, 324, N'Gambio' UNION ALL
	SELECT 643, 24, 324, N'do Gambii' UNION ALL
	SELECT 644, 25, 324, N'w Gambii' UNION ALL
	SELECT 645, 8, 325, N'Australia' UNION ALL
	SELECT 646, 9, 325, N'Australii' UNION ALL
	SELECT 647, 10, 325, N'Australii' UNION ALL
	SELECT 648, 11, 325, N'Australię' UNION ALL
	SELECT 649, 12, 325, N'z Australią' UNION ALL
	SELECT 650, 13, 325, N'Australii' UNION ALL
	SELECT 651, 14, 325, N'Australio' UNION ALL
	SELECT 652, 24, 325, N'do Australii' UNION ALL
	SELECT 653, 25, 325, N'w Australii' UNION ALL
	SELECT 654, 8, 326, N'Haiti' UNION ALL
	SELECT 655, 9, 326, N'Haiti' UNION ALL
	SELECT 656, 10, 326, N'Haiti' UNION ALL
	SELECT 657, 11, 326, N'Haiti' UNION ALL
	SELECT 658, 12, 326, N'z Haiti' UNION ALL
	SELECT 659, 13, 326, N'Haiti' UNION ALL
	SELECT 660, 14, 326, N'Haiti' UNION ALL
	SELECT 661, 24, 326, N'na Haiti' UNION ALL
	SELECT 662, 25, 326, N'na Haiti' UNION ALL
	SELECT 663, 8, 327, N'Portoryko' UNION ALL
	SELECT 664, 9, 327, N'Portoryko' UNION ALL
	SELECT 665, 10, 327, N'Portoryko' UNION ALL
	SELECT 666, 11, 327, N'Portoryko' UNION ALL
	SELECT 667, 12, 327, N'z Portoryko' UNION ALL
	SELECT 668, 13, 327, N'Portoryko' UNION ALL
	SELECT 669, 14, 327, N'Portoryko' UNION ALL
	SELECT 670, 24, 327, N'do Portoryko' UNION ALL
	SELECT 671, 25, 327, N'w Portoryko' UNION ALL
	SELECT 672, 8, 328, N'Puerto Rico' UNION ALL
	SELECT 673, 9, 328, N'Puerto Rico' UNION ALL
	SELECT 674, 10, 328, N'Puerto Rico' UNION ALL
	SELECT 675, 11, 328, N'Puerto Rico' UNION ALL
	SELECT 676, 12, 328, N'z Puerto Rico' UNION ALL
	SELECT 677, 13, 328, N'Puerto Rico' UNION ALL
	SELECT 678, 14, 328, N'Puerto Rico' UNION ALL
	SELECT 679, 24, 328, N'do Puerto Rico' UNION ALL
	SELECT 680, 25, 328, N'w Puerto Rico' UNION ALL
	SELECT 681, 8, 330, N'Namibia' UNION ALL
	SELECT 682, 9, 330, N'Namibii' UNION ALL
	SELECT 683, 10, 330, N'Namibii' UNION ALL
	SELECT 684, 11, 330, N'Namibię' UNION ALL
	SELECT 685, 12, 330, N'z Namibią' UNION ALL
	SELECT 686, 13, 330, N'Namibii' UNION ALL
	SELECT 687, 14, 330, N'Namibio' UNION ALL
	SELECT 688, 24, 330, N'do Namibii' UNION ALL
	SELECT 689, 25, 330, N'w Namibii' UNION ALL
	SELECT 690, 8, 333, N'Zambia' UNION ALL
	SELECT 691, 9, 333, N'Zambii' UNION ALL
	SELECT 692, 10, 333, N'Zambii' UNION ALL
	SELECT 693, 11, 333, N'Zambię' UNION ALL
	SELECT 694, 12, 333, N'z Zambią' UNION ALL
	SELECT 695, 13, 333, N'Zambii' UNION ALL
	SELECT 696, 14, 333, N'Zambio' UNION ALL
	SELECT 697, 24, 333, N'do Zambii' UNION ALL
	SELECT 698, 25, 333, N'w Zambii' UNION ALL
	SELECT 699, 8, 339, N'Afganistan' UNION ALL
	SELECT 700, 9, 339, N'Afganistanu' UNION ALL
	SELECT 701, 10, 339, N'Afganistanowi' UNION ALL
	SELECT 702, 11, 339, N'Afganistan' UNION ALL
	SELECT 703, 12, 339, N'z Afganistanem' UNION ALL
	SELECT 704, 13, 339, N'Afganistanie' UNION ALL
	SELECT 705, 14, 339, N'Afganistanie' UNION ALL
	SELECT 706, 24, 339, N'do Afganistanu' UNION ALL
	SELECT 707, 25, 339, N'w Afganistanie' UNION ALL
	SELECT 708, 8, 340, N'Pakistan' UNION ALL
	SELECT 709, 9, 340, N'Pakistanu' UNION ALL
	SELECT 710, 10, 340, N'Pakistanowi' UNION ALL
	SELECT 711, 11, 340, N'Pakistan' UNION ALL
	SELECT 712, 12, 340, N'z Pakistanem' UNION ALL
	SELECT 713, 13, 340, N'Pakistanie' UNION ALL
	SELECT 714, 14, 340, N'Pakistanie' UNION ALL
	SELECT 715, 24, 340, N'do Pakistanu' UNION ALL
	SELECT 716, 25, 340, N'w Pakistanie' UNION ALL
	SELECT 717, 8, 341, N'Uzbekistan' UNION ALL
	SELECT 718, 9, 341, N'Uzbekistanu' UNION ALL
	SELECT 719, 10, 341, N'Uzbekistanowi' UNION ALL
	SELECT 720, 11, 341, N'Uzbekistan' UNION ALL
	SELECT 721, 12, 341, N'z Uzbekistanem' UNION ALL
	SELECT 722, 13, 341, N'Uzbekistanie' UNION ALL
	SELECT 723, 14, 341, N'Uzbekistanie' UNION ALL
	SELECT 724, 24, 341, N'do Uzbekistanu' UNION ALL
	SELECT 725, 25, 341, N'w Uzbekistanie' UNION ALL
	SELECT 726, 8, 342, N'Turkmenistan' UNION ALL
	SELECT 727, 9, 342, N'Turkmenistanu' UNION ALL
	SELECT 728, 10, 342, N'Turkmenistanowi' UNION ALL
	SELECT 729, 11, 342, N'Turkmenistan' UNION ALL
	SELECT 730, 12, 342, N'z Turkmenistanem' UNION ALL
	SELECT 731, 13, 342, N'Turkmenistanie' UNION ALL
	SELECT 732, 14, 342, N'Turkmenistanie' UNION ALL
	SELECT 733, 24, 342, N'do Turkmenistanu' UNION ALL
	SELECT 734, 25, 342, N'w Turkmenistanie' UNION ALL
	SELECT 735, 8, 343, N'Tadżykistan' UNION ALL
	SELECT 736, 9, 343, N'Tadżykistanu' UNION ALL
	SELECT 737, 10, 343, N'Tadżykistanowi' UNION ALL
	SELECT 738, 11, 343, N'Tadżykistan' UNION ALL
	SELECT 739, 12, 343, N'z Tadżykistanem' UNION ALL
	SELECT 740, 13, 343, N'Tadżykistanie' UNION ALL
	SELECT 741, 14, 343, N'Tadżykistanie' UNION ALL
	SELECT 742, 24, 343, N'do Tadżykistanu' UNION ALL
	SELECT 743, 25, 343, N'w Tadżykistanie' UNION ALL
	SELECT 744, 8, 344, N'Kirgistan' UNION ALL
	SELECT 745, 9, 344, N'Kirgistanu' UNION ALL
	SELECT 746, 10, 344, N'Kirgistanowi' UNION ALL
	SELECT 747, 11, 344, N'Kirgistan' UNION ALL
	SELECT 748, 12, 344, N'z Kirgistanem' UNION ALL
	SELECT 749, 13, 344, N'Kirgistanie' UNION ALL
	SELECT 750, 14, 344, N'Kirgistanie' UNION ALL
	SELECT 751, 24, 344, N'do Kirgistanu' UNION ALL
	SELECT 752, 25, 344, N'w Kirgistanie' UNION ALL
	SELECT 753, 8, 346, N'Mongolia' UNION ALL
	SELECT 754, 9, 346, N'Mongolii' UNION ALL
	SELECT 755, 10, 346, N'Mongolii' UNION ALL
	SELECT 756, 11, 346, N'Mongolię' UNION ALL
	SELECT 757, 12, 346, N'z Mongolią' UNION ALL
	SELECT 758, 13, 346, N'Mongolii' UNION ALL
	SELECT 759, 14, 346, N'Mongolio' UNION ALL
	SELECT 760, 24, 346, N'do Mongolii' UNION ALL
	SELECT 761, 25, 346, N'w Mongolii' UNION ALL
	SELECT 762, 8, 360, N'Indonezja' UNION ALL
	SELECT 763, 9, 360, N'Indonezji' UNION ALL
	SELECT 764, 10, 360, N'Indonezji' UNION ALL
	SELECT 765, 11, 360, N'Indonezję' UNION ALL
	SELECT 766, 12, 360, N'z Indonezją' UNION ALL
	SELECT 767, 13, 360, N'Indonezji' UNION ALL
	SELECT 768, 14, 360, N'Indonezjo' UNION ALL
	SELECT 769, 24, 360, N'do Indonezji' UNION ALL
	SELECT 770, 25, 360, N'w Indonezji' UNION ALL
	SELECT 771, 8, 361, N'Malezja' UNION ALL
	SELECT 772, 9, 361, N'Malezji' UNION ALL
	SELECT 773, 10, 361, N'Malezji' UNION ALL
	SELECT 774, 11, 361, N'Malezję' UNION ALL
	SELECT 775, 12, 361, N'z Malezją' UNION ALL
	SELECT 776, 13, 361, N'Malezji' UNION ALL
	SELECT 777, 14, 361, N'Malezjo' UNION ALL
	SELECT 778, 24, 361, N'do Malezji' UNION ALL
	SELECT 779, 25, 361, N'w Malezji' UNION ALL
	SELECT 780, 8, 397, N'Nowa Zelandia' UNION ALL
	SELECT 781, 9, 397, N'Nowej Zelandii' UNION ALL
	SELECT 782, 10, 397, N'Nowej Zelandii' UNION ALL
	SELECT 783, 11, 397, N'Nową Zelandię' UNION ALL
	SELECT 784, 12, 397, N'z Nową Zelandią' UNION ALL
	SELECT 785, 13, 397, N'Nowej Zelandii' UNION ALL
	SELECT 786, 14, 397, N'Nowa Zelandio' UNION ALL
	SELECT 787, 24, 397, N'do Nowej Zelandii' UNION ALL
	SELECT 788, 25, 397, N'w Nowej Zelandii' UNION ALL
	SELECT 789, 8, 398, N'Fidżi' UNION ALL
	SELECT 790, 9, 398, N'Fidżi' UNION ALL
	SELECT 791, 10, 398, N'Fidżi' UNION ALL
	SELECT 792, 11, 398, N'Fidżi' UNION ALL
	SELECT 793, 12, 398, N'z Fidżi' UNION ALL
	SELECT 794, 13, 398, N'Fidżi' UNION ALL
	SELECT 795, 14, 398, N'Fidżi' UNION ALL
	SELECT 796, 24, 398, N'na Fidżi' UNION ALL
	SELECT 797, 25, 398, N'na Fidżi' UNION ALL
	SELECT 798, 8, 420, N'Liberia' UNION ALL
	SELECT 799, 9, 420, N'Liberii' UNION ALL
	SELECT 800, 10, 420, N'Liberii' UNION ALL
	SELECT 801, 11, 420, N'Liberię' UNION ALL
	SELECT 802, 12, 420, N'z Liberią' UNION ALL
	SELECT 803, 13, 420, N'Liberii' UNION ALL
	SELECT 804, 14, 420, N'Liberio' UNION ALL
	SELECT 805, 24, 420, N'do Liberii' UNION ALL
	SELECT 806, 25, 420, N'w Liberii' UNION ALL
	SELECT 807, 8, 427, N'Zimbabwe' UNION ALL
	SELECT 808, 9, 427, N'Zimbabwe' UNION ALL
	SELECT 809, 10, 427, N'Zimbabwe' UNION ALL
	SELECT 810, 11, 427, N'Zimbabwe' UNION ALL
	SELECT 811, 12, 427, N'z Zimbabwe' UNION ALL
	SELECT 812, 13, 427, N'Zimbabwe' UNION ALL
	SELECT 813, 14, 427, N'Zimbabwe' UNION ALL
	SELECT 814, 24, 427, N'do Zimbabwe' UNION ALL
	SELECT 815, 25, 427, N'w Zimbabwe' UNION ALL
	SELECT 816, 8, 429, N'Seszele' UNION ALL
	SELECT 817, 9, 429, N'Seszeli' UNION ALL
	SELECT 818, 10, 429, N'Seszelom' UNION ALL
	SELECT 819, 11, 429, N'Seszele' UNION ALL
	SELECT 820, 12, 429, N'z Seszelami' UNION ALL
	SELECT 821, 13, 429, N'Seszelach' UNION ALL
	SELECT 822, 14, 429, N'Seszele' UNION ALL
	SELECT 823, 24, 429, N'na Seszele' UNION ALL
	SELECT 824, 25, 429, N'na Seszelach' UNION ALL
	SELECT 825, 8, 433, N'USA' UNION ALL
	SELECT 826, 9, 433, N'USA' UNION ALL
	SELECT 827, 10, 433, N'USA' UNION ALL
	SELECT 828, 11, 433, N'USA' UNION ALL
	SELECT 829, 12, 433, N'z USA' UNION ALL
	SELECT 830, 13, 433, N'USA' UNION ALL
	SELECT 831, 14, 433, N'USA' UNION ALL
	SELECT 832, 24, 433, N'do USA' UNION ALL
	SELECT 833, 25, 433, N'w USA' UNION ALL
	SELECT 834, 8, 446, N'Burundi' UNION ALL
	SELECT 835, 9, 446, N'Burundi' UNION ALL
	SELECT 836, 10, 446, N'Burundi' UNION ALL
	SELECT 837, 11, 446, N'Burundi' UNION ALL
	SELECT 838, 12, 446, N'z Burundi' UNION ALL
	SELECT 839, 13, 446, N'Burundi' UNION ALL
	SELECT 840, 14, 446, N'Burundi' UNION ALL
	SELECT 841, 24, 446, N'do Burundi' UNION ALL
	SELECT 842, 25, 446, N'w Burundi' UNION ALL
	SELECT 843, 8, 450, N'Kongo' UNION ALL
	SELECT 844, 9, 450, N'Kongo' UNION ALL
	SELECT 845, 10, 450, N'Kongo' UNION ALL
	SELECT 846, 11, 450, N'Kongo' UNION ALL
	SELECT 847, 12, 450, N'z Kongo' UNION ALL
	SELECT 848, 13, 450, N'Kongo' UNION ALL
	SELECT 849, 14, 450, N'Kongo' UNION ALL
	SELECT 850, 24, 450, N'do Kongo' UNION ALL
	SELECT 851, 25, 450, N'w Kongo'
COMMIT;
SET IDENTITY_INSERT [dbo].[GrammarForms] OFF


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

GO

-- Tabela przechowująca listę zapytań wyłączonych dla poszczególnych userów.
CREATE TABLE [dbo].[LearningExcludedQuestions] (
      [Id]					INT     IDENTITY (1, 1) NOT NULL
    , [UserId]				INT     NOT NULL
    , [QuestionId]			INT		NOT NULL
    , [LanguageId]			INT		NOT NULL
    , CONSTRAINT [PK_LearningExcludedQuestions] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_LearningExcludedQuestions] UNIQUE NONCLUSTERED ([UserId] ASC, [QuestionId] ASC)
    , CONSTRAINT [FK_LearningExcludedQuestions_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [FK_LearningExcludedQuestions_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
    , CONSTRAINT [FK_LearningExcludedQuestions_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
);

GO

-- Tabela przechowująca listę słów wyłączonych z nauki dla poszczególnych userów.
CREATE TABLE [dbo].[LearningExcludedWords] (
      [Id]					INT     IDENTITY (1, 1) NOT NULL
    , [UserId]				INT     NOT NULL
    , [WordId]				INT		NOT NULL
    , [LanguageId]			INT		NOT NULL
    , CONSTRAINT [PK_LearningExcludedWords] PRIMARY KEY CLUSTERED ([Id] ASC)
    , CONSTRAINT [U_LearningExcludedWords] UNIQUE NONCLUSTERED ([UserId] ASC, [WordId] ASC)
    , CONSTRAINT [FK_LearningExcludedWords_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
    , CONSTRAINT [FK_LearningExcludedWords_Word] FOREIGN KEY ([WordId]) REFERENCES [dbo].[Words] ([Id])
    , CONSTRAINT [FK_LearningExcludedWords_Language] FOREIGN KEY ([LanguageId]) REFERENCES [dbo].[Languages] ([Id])
);