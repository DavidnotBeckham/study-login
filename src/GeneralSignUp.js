import React, { useState, useEffect, useCallback } from 'react';
import './GeneralSignUp.css';

const GeneralSignUp = () => {
  const [emailValue, setEmailValue] = useState({ email: '' });
  const [isVerified, setIsVerified] = useState(false);
  const [isTimeForVeriCode, setIsTimeForVeriCode] = useState(false);
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [timeCount, setTimeCount] = useState(0);
  const [veriCodeValue, setVeriCodeValue] = useState('');

  const emailRegExpr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onValidEmail = useCallback(
    (e) => {
      e.preventDefault();
      fetch('auth.emailCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({
          userEmail: emailValue.email,
        }),
      }).then((res) => {
        if (res.status === 200) {
          setIsTimeForVeriCode(true);
          setIsWithinTime(true);
          setTimeCount(180);
        } else if (res.status === 401) {
          alert('이미 존재하는 이메일입니다.');
        } else if (res.status === 402) {
          alert('이미 인증이 진행중입니다.');
        }
      });
    },
    [emailValue]
  );

  const handleVeriCode = (e) => {
    setVeriCodeValue(e.target.value);
  };

  const onValidVeriCode = (e) => {
    e.preventDefault();
    fetch('auth.verifyCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        userEmail: emailValue.email,
        code: veriCodeValue,
      }),
    }).then((res) => {
      if (res.status === 200) {
        setIsVerified(true);
      } else if (res.status === 401) {
        alert('인증번호가 일치 하지 않습니다.');
      }
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mindary</h1>
        <p>회원가입</p>
      </div>
      <form>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            value={emailValue.email}
            onChange={(e) => setEmailValue({ email: e.target.value })}
            placeholder="이메일을 입력해주세요"
          />
        </div>
        <button
          className="verifyEmailBtn"
          onClick={onValidEmail}
          disabled={!emailRegExpr.test(emailValue.email) || isVerified}
        >
          인증 받기
        </button>
        {isWithinTime && !isVerified ? (
          <Timer timeCount={timeCount} setTimeCount={setTimeCount} />
        ) : null}
        {isTimeForVeriCode ? (
          <>
            <div className="signUpHeader">
              <div className="signUpModalText">인증코드</div>
            </div>
            <div className="form-group">
              <input
                name="emailCode"
                value={veriCodeValue}
                className="codeInput"
                placeholder="인증코드 4자리를 입력해주세요"
                onChange={handleVeriCode}
              />
            </div>
            {isVerified ? (
              <img src="checkImg" alt="확인 완료" className="codeCheckImage" />
            ) : (
              <button
                className="codeCheckBtn"
                onClick={onValidVeriCode}
                disabled={!(veriCodeValue && veriCodeValue.length >= 4)}
              >
                확인
              </button>
            )}
          </>
        ) : null}
      </form>
    </div>
  );
};

const Timer = ({ timeCount, setTimeCount }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimeCount((timeCount) => timeCount - 1);
    }, 1000);

    if (timeCount === 0) {
      clearInterval(id);
    }
    return () => clearInterval(id);
  }, [timeCount]);

  return (
    <div className="timerContainer">
      <span className="timerText">{formatTime(timeCount)}</span>
    </div>
  );
};

export default GeneralSignUp;
