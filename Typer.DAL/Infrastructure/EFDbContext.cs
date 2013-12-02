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

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserDto>().ToTable("Users");
            modelBuilder.Entity<QuestionDto>().ToTable("Questions");
            modelBuilder.Entity<LanguageDto>().ToTable("Languages");
            modelBuilder.Entity<UserLanguageDto>().ToTable("UserLanguages");
            modelBuilder.Entity<QuestionOptionDto>().ToTable("QuestionOptions");
            modelBuilder.Entity<MetawordDto>().ToTable("Metawords");
            modelBuilder.Entity<WordDto>().ToTable("Words");
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