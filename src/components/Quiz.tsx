import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePetWallet } from '../utils/LocalDataManager';
import CheckCoin from '../utils/CheckCoin';
import { completeTask } from '../utils/TaskManager';
import {checkQuizAchievements} from '../utils/AchievementManager'

const quizQuestions = [
  {
    question: 'Which of these can’t you insure?',
    answers: ['Break-ins', 'Early stage cancer', 'Friends', 'Flood damage'],
    correctAnswer: 'Friends',
  },
  {
    question: 'When do you claim for Life Insurance?',
    answers: ['Death of the policy holder', 'Death of a family member', 'Death of a pet', 'Hospitalization of the policy holder'],
    correctAnswer: 'Death of the policy holder',
  },
  {
    question: 'What does auto insurance protect?',
    answers: ['Pets', 'Cars', 'House', 'Tech'],
    correctAnswer: 'Cars',
  },
  {
    question: 'What is not included under Travel Insurance?',
    answers: ['Flight delays', 'Baggage delays', 'Missed travel connections', 'Death or Permanent Disability'],
    correctAnswer: 'Missed travel connections',
  },
  {
    question: 'Is it compulsory to maintain your car insurance?',
    answers: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'Where did the highest Takaful insurance contribution come from?',
    answers: ['Saudi Arabia', 'Malaysia', 'Indonesia', 'United Arab Emirates'],
    correctAnswer: 'Saudi Arabia',
  },
  {
    question: 'Who is the Largest General / Takaful insurer in Malaysia?',
    answers: ['AIA', 'Etiqa', 'Prudential', 'Allizanz'],
    correctAnswer: 'Etiqa',
  },
  {
    question: 'When was Etiqa founded?',
    answers: ['2004', '2005', '2006', '2007'],
    correctAnswer: '2004',
  },
  {
    question: 'What is a "Beneficiary"?',
    answers: ['A person that gains money from the policy', 'A person that pays for the policy'],
    correctAnswer: 'A person that gains money from the policy',
  },
  {
    question: 'What is “Premium”?',
    answers: ['Amount paid to maintain insurance', 'Amount received from insurance'],
    correctAnswer: 'Amount paid to maintain insurance',
  },
  {
    question: 'What is “Rider”?',
    answers: ['An insured person', 'Add-on insurance plan', 'A motorbike rider', 'A motor insurance'],
    correctAnswer: 'Add-on insurance plan',
  },
  {
    question: 'What is “Deductible”?',
    answers: ['Insurance initial payment', 'Insurance discount', 'Tax deductible'],
    correctAnswer: 'Insurance initial payment',
  },
  {
    question: 'What is a “Policyholder”?',
    answers: ['The person owns for the insurance', 'The person that receives the insurance'],
    correctAnswer: 'The person owns for the insurance',
  },
  {
    question: 'If hospitalized, can you claim health insurance? (if owned)?',
    answers: ['Yes', 'No'],
    correctAnswer: 'Yes',
  },
  {
    question: 'What is PA insurance?',
    answers: ['Personal Assistance', 'Private Assets', 'Personal Accident'],
    correctAnswer: 'Personal Accident',
  },
  {
    question: 'What is covered by “Houseowner” insurance?',
    answers: ['Stolen household goods', 'House structural damage'],
    correctAnswer: 'House structural damage',
  },
  {
    question: 'What is covered by “Householder” insurance?',
    answers: ['Stolen household goods', 'House structural damage'],
    correctAnswer: 'Stolen household goods',
  },
  {
    question: 'What is not covered by Houseowner insurance?',
    answers: ['Wall damage', 'Gate damage', 'Natural disasters', 'Stolen TV'],
    correctAnswer: 'Stolen TV',
  },
  {
    question: 'What is not covered by Householder insurance?',
    answers: ['Burglary', 'Natural disasters', 'Stolen TV'],
    correctAnswer: 'Natural disasters',
  },
  {
    question: 'What is not covered by Travel insurance?',
    answers: ['Flight delays', 'Covid-19 infection', 'Medical', 'Food'],
    correctAnswer: 'Food',
  },
];

const getRandomQuestions = (questionsArray: typeof quizQuestions, count: number) => {
  const shuffled = [...questionsArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

type RootStackParamList = {
  Home: undefined;
  Quiz: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type QuizScreenProps = StackScreenProps<RootStackParamList, 'Quiz'>;

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [questions, setQuestions] = useState<typeof quizQuestions>([]);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [oid, setOid] = useState<string | null>(null);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(false);

  useEffect(() => {
    const fetchOid = async () => {
      try {
        const storedOid = await AsyncStorage.getItem('oid'); // Assuming 'oid' is the key you stored it under
        if (storedOid !== null) {
          setOid(storedOid); // Set the oid to state
        } else {
          console.log('No oid found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching oid from AsyncStorage:', error);
      }
    };

    fetchOid();
  }, []);

  useEffect(() => {
    const checkQuizStatus = async () => {
      const lastCompleted = await AsyncStorage.getItem('quizCompletedDate');
      const today = new Date().toDateString();
      if (lastCompleted === today) {
        setHasCompletedQuiz(true);
      } else {
        setQuestions(getRandomQuestions(quizQuestions, 5));
        setHasCompletedQuiz(false);
      }
    };

    checkQuizStatus();
    completeTask('Daily quiz');
  }, []);



  const handleBackButton = async () => {
    const petName = await AsyncStorage.getItem('petName');
    const character = await AsyncStorage.getItem('character');
    if (petName && character) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainGame', params: { petName, character } }],
      });
    } else {
      navigation.navigate('CreateName');
    }
  };

  const handleReward = async () => {
    const rewardCoins = score * 5;
    let updatedCoins = userCoins + rewardCoins;
    if (score === 5) {
      Alert.alert('Congratulations!', 'You got all the answers correct! You earned BONUS 15 coins!');
      updatedCoins += 15; // Bonus 15 coins for perfect score
    
      // Update perfect score count
    const currentPerfectScores = await AsyncStorage.getItem('perfectQuizScores');
    const newPerfectScores = currentPerfectScores ? parseInt(currentPerfectScores) + 1 : 1;
    await AsyncStorage.setItem('perfectQuizScores', newPerfectScores.toString());
    await checkQuizAchievements();
    }
    setUserCoins(updatedCoins);
    await updatePetWallet({ coins: updatedCoins });
    await AsyncStorage.setItem('quizCompletedDate', new Date().toDateString());
    handleBackButton();
  };

  const handleAnswerPress = (answer: string) => {
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setFeedback('Correct!');
      setScore((prevScore) => prevScore + 1);
    } else {
      setFeedback(`Incorrect! The correct answer was: ${currentQuestion.correctAnswer}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    } else {
      setQuizComplete(true); // Mark quiz as complete when all questions are answered
    }
  };

  if (hasCompletedQuiz) {
    return (
      <View style={styles.container}>
        <FastImage
          style={styles.background}
          source={require('../assets/images/mainMenuBG2.jpeg')}
          resizeMode="cover"
        />
        <View style={styles.quizBox}>
          <Text style={styles.tryagaintext}>You already tried your quiz today, try again tomorrow!</Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleBackButton}>
            <Text style={styles.buttonText}>Back to Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.background}
        source={require('../assets/images/mainMenuBG2.jpeg')}
        resizeMode="cover"
      />

      {!quizComplete ? (
        <View style={styles.quizBox}>
          <Text style={styles.headerText}>Daily Quiz</Text>
          <Text style={styles.questionText}>{questions[currentQuestionIndex]?.question}</Text>

          <View style={styles.answerContainer}>
            {questions[currentQuestionIndex]?.answers.map((answer, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  selectedAnswer === answer ? styles.selectedAnswerButton : {},
                ]}
                onPress={() => handleAnswerPress(answer)}
                disabled={!!feedback} // Disable buttons if feedback is shown
              >
                <Text style={styles.answerText}>{answer}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}

          {feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedback}</Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                <Text style={styles.buttonText}>Next Question</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.quizBox}>
          <Text style={styles.headerText}>Quiz Complete!</Text>
          <Text style={styles.finalScoreText}>Your final score is: {score}/{questions.length}</Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleReward}>
            <Text style={styles.buttonText}>Finish Quiz</Text>
            <Text style={styles.rewardText}>You earned {score * 5} coins!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back arrow button in the top left corner */}
      <TouchableOpacity
        style={styles.backArrowButton}
        onPress={handleBackButton}
      >
        <FastImage
          source={require('../assets/images/back_arrow_icon.png')}
          style={styles.backArrowIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  quizBox: {
    backgroundColor: 'rgba(255, 165, 0, 0.7)', // Light orange transparent background
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 10,
  },
  tryagaintext: {
    fontSize: 15,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  answerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: 275, // Fixed width for all answer buttons to maintain uniformity
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAnswerButton: {
    backgroundColor: '#d3d3d3',
  },
  answerText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: 'black',
    textAlign: 'center',
  },
  feedbackContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  finishButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'joystix monospace',
    textAlign: 'center',
  },
  finalScoreText: {
    fontSize: 20,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  backArrowButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backArrowIcon: {
    width: 30,
    height: 30,
  },
  rewardText: {
    fontSize: 15,
    fontFamily: 'joystix monospace',
    color: 'black',
    textAlign: 'center',
  },
});
