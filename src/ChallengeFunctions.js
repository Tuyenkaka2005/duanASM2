import { PlusIcon } from "@heroicons/react/solid"; // Hoặc thư viện tương ứng
import CreateChallengeModal from "./CreateChallengeModal";
import Leaderboard from "./Leaderboard";
import ContentExplorer from "./ContentExplorer";

const ChallengeFunctions = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateChallenge = (newChallenge) => {
    createChallenge(newChallenge); // Gọi hàm từ `TrendifyApp`
    setShowCreateModal(false); // Đóng modal sau khi tạo
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded flex items-center"
      >
        <PlusIcon className="mr-2" /> Create Challenge
      </button>

      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChallenge}
        />
      )}
    </div>
  );
};
import React, { useState } from "react";

// Enhanced Mock Data with more fields
const mockChallenges = [
  {
    id: 1,
    title: "30 Second Dance Challenge",
    creator: "TrendMaster",
    creatorId: "user123",
    points: 50,
    difficulty: "Easy",
    mediaUrl: "/api/placeholder/300/200",
    likes: 245,
    participants: 120,
    category: "Dance",
    entries: [],
    comments: [],
    created: new Date("2024-11-22"),
  },
  {
    id: 2,
    title: "DIY Room Decor Challenge",
    creator: "CraftQueen",
    creatorId: "user456",
    points: 75,
    difficulty: "Medium",
    mediaUrl: "/api/placeholder/300/200",
    likes: 189,
    participants: 85,
    category: "Craft",
    entries: [],
    comments: [],
    created: new Date("2024-11-23"),
  },
];

// User State (mock authenticated user)
const mockUser = {
  id: "currentUser123",
  username: "ChallengeEnthusiast",
  points: 350,
  level: 3,
  following: ["user123", "user456"],
  achievements: ["First Challenge", "Social Butterfly"],
  joinedChallenges: [],
  createdChallenges: [],
  notifications: [],
};

const TrendifyApp = () => {
  const [selectedTab, setSelectedTab] = useState("home");
  const [challenges, setChallenges] = useState(mockChallenges);
  const [user, setUser] = useState(mockUser);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Challenge Functions
  const createChallenge = (newChallenge) => {
    const challenge = {
      id: challenges.length + 1,
      creator: user.username,
      creatorId: user.id,
      likes: 0,
      participants: 0,
      entries: [],
      comments: [],
      created: new Date(),
      ...newChallenge,
    };
    setChallenges([challenge, ...challenges]);
    setUser({
      ...user,
      createdChallenges: [...user.createdChallenges, challenge.id],
      points: user.points + 50, // Points for creating challenge
    });
  };

  const joinChallenge = (challengeId) => {
    if (!user.joinedChallenges.includes(challengeId)) {
      setUser({
        ...user,
        joinedChallenges: [...user.joinedChallenges, challengeId],
        points: user.points + 10,
      });
      setChallenges(
        challenges.map((c) =>
          c.id === challengeId ? { ...c, participants: c.participants + 1 } : c
        )
      );
    }
  };

  const likeChallenge = (challengeId) => {
    // Giả sử user chỉ được thích một lần
    const updatedChallenges = challenges.map((c) => {
      if (c.id === challengeId && !c.likedBy?.includes(user.id)) {
        return {
          ...c,
          likes: c.likes + 1,
          likedBy: [...(c.likedBy || []), user.id], // Lưu danh sách user đã thích
        };
      }
      return c;
    });
    setChallenges(updatedChallenges);
  };

  // Social Functions
  const followUser = (userId) => {
    if (!user.following.includes(userId)) {
      setUser({
        ...user,
        following: [...user.following, userId],
        points: user.points + 5, // Points for following
      });
    }
  };

  const addComment = (challengeId, comment) => {
    if (!comment.trim()) return; // Bỏ qua nếu comment rỗng
    setChallenges(
      challenges.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              comments: [
                ...c.comments,
                {
                  id: Date.now(),
                  userId: user.id,
                  username: user.username,
                  text: comment.trim(),
                  timestamp: new Date(),
                },
              ],
            }
          : c
      )
    );
  };

  // Points System Functions
  const checkLevelUp = (points) => {
    const newLevel = Math.floor(points / 100) + 1;
    if (newLevel > user.level) {
      setUser({
        ...user,
        level: newLevel,
        achievements: [...user.achievements, `Reached Level ${newLevel}!`],
      });
    }
  };

  const awardPoints = (amount, reason) => {
    const newPoints = user.points + amount;
    setUser({
      ...user,
      points: newPoints,
      notifications: [
        ...user.notifications,
        `Earned ${amount} points for ${reason}!`,
      ],
    });
    checkLevelUp(newPoints);
  };

  // Content Management Functions
  const filterChallenges = () => {
    let filtered = [...challenges];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => b.created - a.created);
        break;
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "participants":
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      default:
        break;
    }

    return filtered;
  };

  // Main render components remain the same, but now use these functions
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trendify</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search challenges..."
            className="px-3 py-1 rounded text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-2 py-1 rounded text-black"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Dance">Dance</option>
            <option value="Craft">Craft</option>
          </select>
          <select
            className="px-2 py-1 rounded text-black"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="participants">Most Participants</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {selectedTab === "home" && (
          <ChallengeFeed
            challenges={filterChallenges()}
            onJoin={joinChallenge}
            onLike={likeChallenge}
            onComment={addComment}
            currentUser={user}
          />
        )}
        {selectedTab === "leaderboard" && <Leaderboard user={user} />}
        {selectedTab === "explore" && <ContentExplorer />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t flex justify-around p-4">
        <button
          onClick={() => setSelectedTab("home")}
          className={`flex flex-col items-center ${
            selectedTab === "home" ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => setSelectedTab("leaderboard")}
          className={`flex flex-col items-center ${
            selectedTab === "leaderboard" ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">🏆</span>
          <span className="text-xs">Leaderboard</span>
        </button>
        <button
          onClick={() => setSelectedTab("explore")}
          className={`flex flex-col items-center ${
            selectedTab === "explore" ? "text-purple-600" : "text-gray-500"
          }`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-xs">Explore</span>
        </button>
      </nav>
    </div>
  );
};

// Enhanced ChallengeFeed component
const ChallengeFeed = ({
  challenges,
  onJoin,
  onLike,
  onComment,
  currentUser,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Daily Challenges</h2>
      {challenges.map((challenge) => (
        <div key={challenge.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <img
              src={challenge.mediaUrl}
              alt={challenge.title}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-grow">
              <h3 className="font-semibold">{challenge.title}</h3>
              <p className="text-sm text-gray-500">By {challenge.creator}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm bg-green-100 text-green-600 px-2 rounded">
                  {challenge.difficulty}
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {challenge.points} pts
                </span>
              </div>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => onLike(challenge.id)}
                  className="text-gray-500 hover:text-purple-600"
                >
                  ❤️ {challenge.likes}
                </button>
                <span className="text-gray-500">
                  👥 {challenge.participants} joined
                </span>
              </div>
            </div>
            <button
              onClick={() => onJoin(challenge.id)}
              className={`px-4 py-2 rounded ${
                currentUser.joinedChallenges.includes(challenge.id)
                  ? "bg-green-500 text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              {currentUser.joinedChallenges.includes(challenge.id)
                ? "Joined"
                : "Join"}
            </button>
          </div>
          {/* Comments section */}
          <div className="mt-4 border-t pt-2">
            <div className="space-y-2">
              {challenge.comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <span className="font-semibold">{comment.username}: </span>
                  {comment.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const comment = e.target.comment.value;
                if (comment.trim()) {
                  onComment(challenge.id, comment);
                  e.target.reset();
                }
              }}
              className="mt-2 flex"
            >
              <input
                name="comment"
                placeholder="Add a comment..."
                className="flex-grow px-2 py-1 border rounded-l"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-purple-600 text-white rounded-r"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendifyApp;
