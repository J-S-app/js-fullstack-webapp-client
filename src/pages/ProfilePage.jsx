import './ProfilePage.css';
import ProfileLeftBar from '../components/ProfilePage/ProfileLeftBar'
import ProfileFeeds from '../components/ProfilePage/ProfileFeeds'
import { useParams } from 'react-router-dom';
import { AuthContext } from "../context/auth.context"
import apiServices from '../services/APIServices';
import { useState, useEffect, useContext } from "react";
import { NavLink } from 'react-router-dom';



const ProfilePage = () => {
  const { userId } = useParams()
  const { user } = useContext(AuthContext);

  const [followersList, setFollowersList] = useState([])
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [userDetail, setUserDetail] = useState({});
  const [followresponse, setFollowresponse] = useState([]);
  const [followUnfollow, setFollowUnfollow] = useState(false)


  const storedToken = localStorage.getItem("authToken");
  const header = { headers: { Authorization: `Bearer ${storedToken}` } }



  const handleFollow = () => {
    apiServices
      .followUserRoute(userId, header, header)
      .then(response => setFollowresponse(response.data))
      .catch(error => {
        const errorDescription = error.response.data.message;
        console.log("error  followings users", errorDescription)
        setErrorMessage(errorDescription);
      })
  }



  const handleCreateMessage = () => {

    const requestBody = {
      currentUserId: user?._id,
      messageReciverId: userId
    }

    apiServices
      .createChatRoute(requestBody,header)
      .then(response=>console.log(response.data))
      .catch(error => {
        const errorDescription = error.response.data.message;
        console.log("error  getting user detail", errorDescription)
        setErrorMessage(errorDescription);
      })
  }






  useEffect(() => {
    apiServices
      .userDetailsRoute(userId, header)
      .then(response => setUserDetail(response.data))
      .catch(error => {
        const errorDescription = error.response.data.message;
        console.log("error  getting user detail", errorDescription)
        setErrorMessage(errorDescription);
      })

  }, [userId, followresponse])




  //get followers list
  const callBackFollowersList = () => {
    if (user) {
      apiServices
        .getFollowersRoute(user._id, header)
        .then(response => {
          setFollowersList(response.data)
        })
        .catch(error => {
          const errorDescription = error.response.data.message;
          console.log("error getting all followers", errorDescription)
          setErrorMessage(errorDescription);
        })

    } if (user && userId != user?._id) {
      apiServices
        .getFollowersRoute(userId, header)
        .then(response => {
          setFollowersList(response.data)
        })
        .catch(error => {
          const errorDescription = error.response.data.message;
          console.log("error getting all followers", errorDescription)
          setErrorMessage(errorDescription);
        })
    }
  }
  useEffect(() => {
    callBackFollowersList()
  }, [user?._id, followUnfollow, followresponse, userId])


  const GetFollowersList = () => {
    const result = followersList.map((follower, index) => {
      if (index < 8) {
        return (
          <>
            <div className="SideBar-right-online-followers-item">
              <img src={follower.profileImage || require("../assets/placeholder.png")} className="SideBar-right-fallowers-image" />
              <NavLink to={`/profile/${follower._id}`}>
                <h5 className="SideBar-right-online-followers-name">{follower.username}</h5>
              </NavLink>
            </div>
          </>
        )
      }
    })
    return result

  }

  const FollowUnfollow = () => {

    const followbtn = followresponse?.filter(usr => usr._id == userId && usr?.followers.includes(user._id))
    if (followbtn.length > 0) setFollowUnfollow(true)
    // else setFollowUnfollow(false)
  }




  const birthdayDate = String(userDetail.birthday).substring(0, 10)



  return (
    <div className="ProfilePage-container">
      <div className='ProfilePage-left'>
        <ProfileLeftBar userId={userId} />
      </div>

      <div className='ProfilePage-right'>
        <div className='ProfilePage-right-top'>

          <div className='ProfilePage-right-top-images'>
            <img src={userDetail.coverImage || require("../assets/coverimage-placeholder.jpg")} className="ProfilePage-right-top-coverimage" />
            <img src={userDetail.profileImage || require("../assets/placeholder.png")} className="ProfilePage-right-top-profileimage" />
            <div className='ProfilePage-right-top-userinfo'>
              <h3 className="ProfilePage-right-top-username">{userDetail.username}</h3>
              <span className="ProfilePage-right-top-catchphrase">{userDetail.catchPhrase}</span>

            </div>
          </div>
          <>
            {user?._id != userId
              ?
              <div>
                <NavLink to={`/${user._id}/messages`}> <button className='ProfilePage-right-followbtn' onClick={handleCreateMessage}>Send Message</button> </NavLink>
                <button className='ProfilePage-right-followbtn' onClick={handleFollow}>{followresponse ? "Unfollow" : "Follow"}</button>
              </div>
              :
              <NavLink to={`/profile/${userId}/setting`}> Edit Profile </NavLink>
            }
          </>
        </div>
        <div className='ProfilePage-right-userDetail'>
          <div className='ProfilePage-right-ProfileFeeds'>
            <ProfileFeeds userId={userId} />
          </div>
          <div className='ProfilePage-right-bottom-right'>
            <div className='ProfilePage-right-bottom-right-userDetail'>
              <h5><b>Birthday : </b> {birthdayDate == 'undefined' ? '' : birthdayDate}</h5>
              <p><b>Country : </b> {userDetail.country}</p>
              <p><b>About Meme : </b>{userDetail.aboutMeme}</p>
            </div>
            <hr />
            <div className='ProfilePage-right-bottom-right-followerslist'>
              <h4 className='ProfilePage-right-followerslist-title' >Followers</h4>
              <span>
                {followersList.length > 0
                  ?
                  <>
                    <div>
                      {userId == user?._id
                        ?
                        <NavLink to={`/${user?._id}/followers`}>See All</NavLink>
                        :
                        <NavLink to={`/${userId}/followers`}>See All</NavLink>
                      }
                    </div>
                    <div>
                      {GetFollowersList()}
                    </div>

                  </>
                  :
                  ""}

              </span>
            </div>

          </div>
        </div>
      </div>




    </div>
  )
}

export default ProfilePage