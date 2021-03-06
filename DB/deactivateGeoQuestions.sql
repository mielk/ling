USE [ling];

UPDATE
	[dbo].[Questions]
SET
	[IsActive] = 0
WHERE [Id] IN (SELECT
					mqc.[QuestionId]
				FROM
					[dbo].[MatchQuestionCategory] mqc
					LEFT JOIN [dbo].[Questions] q
					ON mqc.[QuestionId] = q.[Id]
				WHERE
					[CategoryId] IN (SELECT [Id] FROM [dbo].[Categories] WHERE [ParentId] = 3)) a