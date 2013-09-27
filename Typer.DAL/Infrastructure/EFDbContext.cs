using Typer.Domain.Entities;
using System.Data.Entity;

namespace Typer.DAL.Infrastructure
{
    public class EFDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
    }
}




