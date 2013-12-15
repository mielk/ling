using System.Data.Entity;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Infrastructure
{
    public class EFDbContext : DbContext
    {

        private static EFDbContext instance;

        public DbSet<UserDto> Users { get; set; }
        public DbSet<QuestionDto> Questions { get; set; }
        public DbSet<LanguageDto> Languages { get; set; }
        public DbSet<UserLanguageDto> UserLanguages { get; set; }
        public DbSet<QuestionOptionDto> QuestionOptions { get; set; }
        public DbSet<MetawordDto> Metawords { get; set; }
        public DbSet<WordDto> Words { get; set; }
        public DbSet<CategoryDto> Categories { get; set; }
        public DbSet<WordCategoryDto> MatchWordCategory { get; set; }

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
        }



        private EFDbContext()
        {
            this.Database.Initialize(false);
        }


        public static EFDbContext getInstance()
        {
            if (instance == null)
            {
                instance = new EFDbContext();
            }

            return instance;

        }

    }
}