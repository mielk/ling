USE [ling];

GO

BEGIN TRANSACTION;

DECLARE @onlySentences BIT = 0;

IF (@onlySentences = 1)
	
	BEGIN

		UPDATE [dbo].[Questions]
		SET [IsActive] = [IsComplex]

		SELECT * INTO [dbo].[TestResults_backup] FROM [dbo].[TestResults];
		DELETE FROM [dbo].[TestResults];

	END

ELSE
	
	BEGIN

		UPDATE [dbo].[Questions]
		SET [IsActive] = 1

		INSERT INTO [dbo].[TestResults](
			[UserId]
		  ,[QuestionId]
		  ,[BaseLanguage]
		  ,[LearnedLanguage]
		  ,[Last50]
		  ,[Counter]
		  ,[CorrectAnswers]
		  ,[LastQuery]
		  ,[ToDo])
		SELECT
			[UserId]
		  ,[QuestionId]
		  ,[BaseLanguage]
		  ,[LearnedLanguage]
		  ,[Last50]
		  ,[Counter]
		  ,[CorrectAnswers]
		  ,[LastQuery]
		  ,[ToDo]
		FROM	
			[dbo].[TestResults_backup] 

	END

COMMIT TRANSACTION;