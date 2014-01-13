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
        public DbSet<WordtypePropertyDto> WordtypeProperties { get; set; }
        public DbSet<GrammarDefinitonDto> GrammarDefinitions { get; set; }
        public DbSet<WordtypePropertyValueDto> WordtypePropertyValues { get; set; }
        public DbSet<GrammarFormDto> GrammarForms { get; set; }
        public DbSet<VariantSetDto> VariantSets { get; set; }
        public DbSet<VariantDto> Variants { get; set; }
        public DbSet<VariantLinkDto> VariantLinks { get; set; }
        public DbSet<VariantConstraintDto> VariantConstraints { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserDto>().ToTable("Users");
            modelBuilder.Entity<QuestionDto>().ToTable("Questions");
            modelBuilder.Entity<LanguageDto>().ToTable("Languages");
            modelBuilder.Entity<UserLanguageDto>().ToTable("UserLanguages");
            modelBuilder.Entity<QuestionOptionDto>().ToTable("QuestionOptions");
            modelBuilder.Entity<MetawordDto>().ToTable("Metawords");
            modelBuilder.Entity<WordDto>().ToTable("Words");
            modelBuilder.Entity<CategoryDto>().ToTable("Categories");
            modelBuilder.Entity<WordCategoryDto>().ToTable("MatchWordCategory");
            modelBuilder.Entity<QuestionCategoryDto>().ToTable("MatchQuestionCategory");
            modelBuilder.Entity<WordtypePropertyDto>().ToTable("WordtypeProperties");
            modelBuilder.Entity<GrammarDefinitonDto>().ToTable("GrammarDefinitions");
            modelBuilder.Entity<WordtypePropertyValueDto>().ToTable("WordsProperties");
            modelBuilder.Entity<GrammarFormDto>().ToTable("GrammarForms");
            modelBuilder.Entity<VariantSetDto>().ToTable("VariantSets");
            modelBuilder.Entity<VariantDto>().ToTable("Variants");
            modelBuilder.Entity<VariantConstraintDto>().ToTable("VariantLimits");
            modelBuilder.Entity<VariantLinkDto>().ToTable("VariantConnections");
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