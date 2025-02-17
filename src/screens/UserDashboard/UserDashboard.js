import React, { useState, useEffect } from "react";
import "./UserDashBoard.css";
import CreatedQuizCard from "../../components/QuizCard/CreatedQuizCard";
import JoinedQuizCard from "../../components/QuizCard/JoinedQuizCard";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import CreateQuiz from "../CreateQuiz/CreateQuiz";

const UserDashboard = ({ user }) => {
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editQuiz, setEditQuiz] = useState([]);
 
  // Fetch Data from the API
  useEffect(() => {
    if (!user.uid) {
      setLoading(false);
      return;
    }
    const fetchQuizData = async () => {
      const results = await fetch(`http://23.102.128.226:5000/API/users/${user.uid}`);
      const quizData = await results.json();
      if (quizData.createdQuiz) setCreatedQuizzes(quizData.createdQuiz);
      if (quizData.attemptedQuiz) setAttemptedQuizzes(quizData.attemptedQuiz);
      setLoading(false);
    };
    if (user) fetchQuizData();
  }, [user]);

  const editQuizHandle = async (title, questions, isOpen) => {
    if (!title) setEditQuiz([]);
    else {
      setLoading(true);
      console.dir({
        quizId: createdQuizzes[editQuiz]._id,
        uid: user.uid,
        title,
        questions,
        isOpen,
      });

      const requestOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: createdQuizzes[editQuiz]._id,
          uid: user.uid,
          title,
          questions,
          isOpen,
        }),
      };
      fetch('http://23.102.128.226:5000/API/edit', requestOptions)
        .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const submitData = isJson && await response.json();

          // check for error response
          if (!response.ok) {
            // get error message from body or default to response status
            const error = (submitData && submitData.message) || response.status;
            return Promise.reject(error);
          }
          else {
           // const submitData = await results.json();
            console.dir(submitData);
            const temp = [...createdQuizzes];
            temp[editQuiz[0]].title = title;
            temp[editQuiz[0]].questions = questions;
            temp[editQuiz[0]].isOpen = isOpen;
            setCreatedQuizzes(temp);
            setEditQuiz([]);
            setLoading(false);

          }
        })
        .catch(error => {
       //   this.setState({ errorMessage: error });
          console.error('There was an error!', error);
        });


      const results = await fetch("http://23.102.128.226:5000/API/quizzes/edit", {
        method: "POST",
        body: JSON.stringify({
          quizId: createdQuizzes[editQuiz]._id,
          uid: user.uid,
          title,
          questions,
          isOpen,
        }),

      });
      if (results && results.statusText === "OK" && results.status === 200) {
        const submitData = await results.json();
        console.dir(submitData);
        const temp = [...createdQuizzes];
        temp[editQuiz[0]].title = title;
        temp[editQuiz[0]].questions = questions;
        temp[editQuiz[0]].isOpen = isOpen;
        setCreatedQuizzes(temp);
        setEditQuiz([]);
        setLoading(false);
      }
      else {
        console.error()
      }
    }
  };

  if (loading) return <LoadingScreen />;

  if (editQuiz.length) {
    return (
      <CreateQuiz
        user={user}
        quizTitle={createdQuizzes[editQuiz].title}
        questions={createdQuizzes[editQuiz].questions}
        isOpen={createdQuizzes[editQuiz].isOpen}
        editQuizHandle={editQuizHandle}
      />
    );
  }
  return (
    <div className="dash-body">
      <div className="quizzes">
        <div className="heading">
          <div className="line-left" />
          <h2>Created </h2>
          <div className="line" />
        </div>
        <div className="card-holder">
          {createdQuizzes.map((quiz, key) => (
            <CreatedQuizCard
              key={key}
              index={key}
              setEditQuiz={setEditQuiz}
              title={quiz.title}
              code={quiz._id}
              responses={quiz.responses}
              questions={quiz.questions.length}
              isOpen={quiz.isOpen}
            />
          ))}
        </div>
      </div>
      <div className="quizzes">
        <div className="heading">
          <div className="line-left" />
          <h2>Attempted </h2>
          <div className="line" />
        </div>
        <div className="card-holder">
          {attemptedQuizzes.map((quiz, key) => (
            <JoinedQuizCard
              key={key}
              title={quiz.title}
              score={quiz.responses[0].score}
              questions={quiz.totalQuestions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
