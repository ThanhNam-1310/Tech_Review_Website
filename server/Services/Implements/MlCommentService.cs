namespace server.Services.Implements
{
    public class MlCommentService(HttpClient httpClient)
    {
        private readonly HttpClient _httpClient = httpClient;
        private record AnalyzeRequest(string Text);
        private record AnalyzeResponse(string Text, string Label, string Label_viet);

        public async Task<string?> PhanLoaiAsync(string noiDung)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync(
                    "/ml/comment/analyze", new AnalyzeRequest(noiDung));
                if (!response.IsSuccessStatusCode) return null;
                var result = await response.Content.ReadFromJsonAsync<AnalyzeResponse>();
                return result?.Label;
            }
            catch
            {
                return null;
            }
        }
    }
}
