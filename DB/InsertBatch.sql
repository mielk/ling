USE [ling];
BEGIN TRANSACTION;

SET IDENTITY_INSERT [dbo].[Questions] ON
INSERT INTO [dbo].[Questions] ([Id],[Name],[Weight],[IsComplex],[WordType],[AskPlural])
SELECT 611,N'uzupełnienie',10,0,1,0 UNION ALL
SELECT 612,N'uczciwość',10,0,1,0 UNION ALL
SELECT 613,N'niewielkie zagadnienia',10,0,1,0 UNION ALL
SELECT 614,N'niemniej jednak',10,0,4,0 UNION ALL
SELECT 615,N'mieć znaczenie',10,0,2,0 UNION ALL
SELECT 616,N'Chcę przez to powiedzieć, że …',10,0,NULL,0 UNION ALL
SELECT 617,N'współczesny',10,0,3,0 UNION ALL
SELECT 618,N'a szczególnie',10,0,4,0 UNION ALL
SELECT 619,N'przykładać dużą wagę do czegoś',10,0,1,0
SET IDENTITY_INSERT [dbo].[Questions] OFF



INSERT INTO [dbo].[QuestionsOptions] ([QuestionId],[LanguageId],[Content],[Weight],[IsMain])

SELECT 611,1,N'uzupełnienie',10,1 UNION ALL
SELECT 611,1,N'dopełnienie',10,0 UNION ALL
SELECT 612,1,N'uczciwość',10,1 UNION ALL
SELECT 613,1,N'niewielkie zagadnienia',10,1 UNION ALL
SELECT 614,1,N'niemniej jednak',10,1 UNION ALL
SELECT 615,1,N'mieć znaczenie',10,1 UNION ALL
SELECT 616,1,N'Chcę przez to powiedzieć, że …',10,1 UNION ALL
SELECT 617,1,N'współczesny',10,1 UNION ALL
SELECT 618,1,N'a szczególnie',10,1 UNION ALL
SELECT 618,1,N'a w szczególności',10,1 UNION ALL
SELECT 619,1,N'przykładać dużą wagę do czegoś',10,1 UNION ALL
SELECT 611,2,N'complement',10,1 UNION ALL
SELECT 611,2,N'supplement',10,0 UNION ALL
SELECT 612,2,N'honesty',10,1 UNION ALL
SELECT 613,2,N'humble concerns',10,1 UNION ALL
SELECT 614,2,N'nonetheless',10,1 UNION ALL
SELECT 615,2,N'(to )matter',10,1 UNION ALL
SELECT 616,2,N'What I want(ed) to say is that …',10,1 UNION ALL
SELECT 617,2,N'contemporary',10,1 UNION ALL
SELECT 618,2,N'particularly',10,1 UNION ALL
SELECT 619,2,N'(to )be attentive to( sth/ something/)',10,1

ROLLBACK TRANSACTION;