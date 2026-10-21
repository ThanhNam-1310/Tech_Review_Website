using System.Globalization;
using System.Text;

namespace server.Common.Helper
{
    public class TextSearch
    {
        public static string NormalizeForSearch(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            var normalized = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }

            // "đ" không tự tách được bằng FormD nên xử lý tay
            return sb.ToString().Normalize(NormalizationForm.FormC)
                .Replace('đ', 'd')
                .Replace('Đ', 'D')
                .ToLowerInvariant();
        }
    }
}
