using System.Data.Entity;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Infrastructure
{
    public class EFDbContext : DbContext
    {

        private static EFDbContext _instance;

        public DbSet<UserDto> Users { get; set; }
        public DbSet<QuestionDto> Questions { get; set; }
        public DbSet<LanguageDto> Languages { get; set; }
        public DbSet<UserLanguageDto> UserLanguages { get; set; }
        public DbSet<QuestionOptionDto> QuestionOptions { get; set; }
        public DbSet<MetawordDto> Metawords { get; set; }
        public DbSet<WordDto> Words { get; set; }
        public DbSet<CategoryDto> Categories { get; set; }
        public DbSet<WordCategoryDto> MatchWordCategory { get; set; }
        public DbSet<QuestionCategoryDto> MatchQuestionCategory { get; set; }
        public DbSet<WordPropertyDefinitionDto> WordPropertyDefinitions { get; set; }
        public DbSet<GrammarPropertyDefinitionDto> GrammarPropertyDefinitions { get; set; }
        public DbSet<GrammarPropertyOptionDto> GrammarPropertyOptions { get; set; }
        public DbSet<GrammarFormDefinitonDto> GrammarDefinitions { get; set; }
        public DbSet<WordtypePropertyValueDto> WordtypePropertyValues { get; set; }
        public DbSet<GrammarFormDto> GrammarForms { get; set; }
        public DbSet<VariantSetDto> VariantSets { get; set; }
        public DbSet<VariantDto> Variants { get; set; }
        public DbSet<VariantConnectionDto> VariantConnections { get; set; }
        public DbSet<VariantLimitDto> VariantLimits { get; set; }
        public DbSet<VariantDependencyDto> VariantDependencies { get; set; }
        public DbSet<DependencyDefinitionDto> DependenciesDefinitions { get; set; }
        public DbSet<VariantSetPropertyDefinitionDto> VariantSetPropertyDefinitions { get; set; }
        public DbSet<VariantSetPropertyValueDto> VariantSetPropertyValues { get; set; }
        public DbSet<GrammarFormDefinitionPropertyDto> GrammarFormDefinitionProperties { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserDto>().ToTable("Users");
            modelBuilder.Entity<QuestionDto>().ToTable("Questions");
            modelBuilder.Entity<LanguageDto>().ToTable("Languages");
            modelBuilder.Entity<UserLanguageDto>().ToTable("UsersLanguages");
            modelBuilder.Entity<QuestionOptionDto>().ToTable("QuestionsOptions");
            modelBuilder.Entity<MetawordDto>().ToTable("Metawords");
            modelBuilder.Entity<WordDto>().ToTable("Words");
            modelBuilder.Entity<CategoryDto>().ToTable("Categories");
            modelBuilder.Entity<WordCategoryDto>().ToTable("MatchWordCategory");
            modelBuilder.Entity<QuestionCategoryDto>().ToTable("MatchQuestionCategory");
            modelBuilder.Entity<WordPropertyDefinitionDto>().ToTable("WordtypeRequiredProperties");
            modelBuilder.Entity<GrammarFormDefinitonDto>().ToTable("GrammarFormDefinitions");
            modelBuilder.Entity<WordtypePropertyValueDto>().ToTable("WordsProperties");
            modelBuilder.Entity<GrammarFormDto>().ToTable("GrammarForms");
            modelBuilder.Entity<VariantSetDto>().ToTable("VariantSets");
            modelBuilder.Entity<VariantDto>().ToTable("Variants");
            modelBuilder.Entity<VariantLimitDto>().ToTable("VariantLimits");
            modelBuilder.Entity<VariantConnectionDto>().ToTable("VariantConnections");
            modelBuilder.Entity<VariantDependencyDto>().ToTable("VariantDependencies");
            modelBuilder.Entity<DependencyDefinitionDto>().ToTable("VariantDependenciesDefinitions");
            modelBuilder.Entity<GrammarPropertyDefinitionDto>().ToTable("GrammarPropertyDefinitions");
            modelBuilder.Entity<GrammarPropertyOptionDto>().ToTable("GrammarPropertyOptions");
            modelBuilder.Entity<VariantSetPropertyDefinitionDto>().ToTable("VariantSetRequiredProperties");
            modelBuilder.Entity<VariantSetPropertyValueDto>().ToTable("VariantSetProperties");
            modelBuilder.Entity<GrammarFormDefinitionPropertyDto>().ToTable("GrammarFormsDefinitionsProperties");
        }



        private EFDbContext()
        {
            Database.Initialize(false);
        }


        public static EFDbContext GetInstance()
        {
            return _instance ?? (_instance = new EFDbContext());
        }


    }
}