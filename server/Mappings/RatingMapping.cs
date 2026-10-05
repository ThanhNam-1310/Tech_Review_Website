using AutoMapper;
using server.Dtos.Rating;
using server.Models;

namespace server.Mappings
{
    public class RatingMapping: Profile
    {
        public RatingMapping()
        {
            CreateMap<Rating, RatingDTO>();
        }
    }
}
