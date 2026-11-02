using System.Security.Cryptography;

namespace SouqSofra.Application.Common
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                iterations: 100_000,
                hashAlgorithm: HashAlgorithmName.SHA256,
                outputLength: 32);

            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash)) return false;

            var parts = storedHash.Split(':');
            if (parts.Length != 2) return false;

            try
            {
                byte[] salt = Convert.FromBase64String(parts[0]);
                byte[] hash = Convert.FromBase64String(parts[1]);

                byte[] computedHash = Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    iterations: 100_000,
                    hashAlgorithm: HashAlgorithmName.SHA256,
                    outputLength: 32);

                return CryptographicOperations.FixedTimeEquals(hash, computedHash);
            }
            catch
            {
                return false;
            }
        }
    }
}
