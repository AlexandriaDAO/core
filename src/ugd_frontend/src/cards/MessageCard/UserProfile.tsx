import React from 'react'
import RatingCard from '../../RatingCard/RatingCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faFlag, faHeart, faStar } from '@fortawesome/free-solid-svg-icons';
import { UserProfileInterface } from './types';
import { useAuthors } from '../../contexts/AuthorContext';

const UserProfile: React.FC<UserProfileInterface> = ({ currentAuthorId, InputMessage }) => {
  const { authors } = useAuthors();
  const author = authors.find(a => a.id === currentAuthorId);


  if (!author) {
    return null;
  }


  return (
    <div className="messageCardAutorDetails">
      <div className="messageCardAuthorProfile">
        <div className="messageCardUserProfile">
          <div className="messageUserProfileImg">
            <img src={`/images/authors/${author.id}.png`} alt="" />
          </div>
          <div className="userAuthorProfile">
            <h2>{author.id}</h2>
            <p><span>Published :</span> 2 days ago</p>

            <label className="profileRatingTextPercentage">
              87% Agree
            </label>
            {/* <div className="profileRatingStars">
              <RatingCard />
            </div> */}
          </div>
        </div>

        <div className="messageCardCalltoActions">
          <div className="innerMessageCardCalltoAction">
            <button> <FontAwesomeIcon icon={faHeart} size="sm" color="red" /> <label>20 Likes</label>  </button>
            <button> <FontAwesomeIcon icon={faComment} size="sm" color="#B6CC22" /> <label>Start Chat</label>  </button>
            <button> <FontAwesomeIcon icon={faFlag} size="sm" color="#767676" /><label> 5 Reports</label>  </button>
            <button> <FontAwesomeIcon icon={faStar} size="sm" color="#FED928" /> <label>20 Reviews</label>  </button>
          </div>

        </div>
      </div>
      <div className="messageCardQuestion">
        <div className="messageInnerQuestion">
          <h2>{InputMessage}</h2>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
