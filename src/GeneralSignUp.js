import React, { useState, useEffect, useCallback } from 'react';
import './GeneralSignUp.css';

const GeneralSignUp = () => {
  const [emailValue, setEmailValue] = useState({ email: '' });
  const [isVerified, setIsVerified] = useState(false);
  const [isTimeForVeriCode, setIsTimeForVeriCode] = useState(false);
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [timeCount, setTimeCount] = useState(0);
  const [veriCodeValue, setVeriCodeValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const emailRegExpr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onValidEmail = useCallback(
    (e) => {
      e.preventDefault();
      fetch('/mindary/accounts/original/send-code', { // 실제 백엔드 주소로 변경
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({
          email: emailValue.email, //원래는 userEmail: ~~~였다.
        }),
      }).then((res) => {
        if (res.status === 200) {
          setIsTimeForVeriCode(true);
          setIsWithinTime(true);
          setTimeCount(180);
          alert('인증번호가 이메일로 전송되었습니다.')
        } else if (res.status === 400) {
          alert('이미 존재하는 이메일입니다.');
        } else {
          alert('오류가 발생했습니다.');
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
    fetch('/mindary/accounts/original/verify-code', { // 실제 백엔드 주소로 변경
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        email: emailValue.email, //원래는 userEmail: ~~~였다.
        code: veriCodeValue,
      }),
    }).then((res) => {
      if (res.status === 200) {
        setIsVerified(true);
        alert("인증 성공")
      } else if (res.status === 400) {
        alert("인증 시간(3분) 초과")
      } else if (res.status === 401) {
        alert('인증번호가 일치 하지 않습니다.');
      }
    });
  };

  const onSubmitSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    fetch('/mindary/accounts/original/register', { //실제 백엔드 주소로 변경
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        email: emailValue.email, //원래는 userEmail: ~~~였다.
        password: password,
        nickname: nickname,
      }),
    }).then((res) => {
      if (res.status === 201) { //원래는 200이었다.
        alert('회원가입 성공');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mindary</h1>
        <p>회원가입</p>
      </div>
      <form onSubmit={onSubmitSignUp}>
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
              <>
                <img src="checkImg" alt="확인 완료" className="codeCheckImage" />
                <div className="form-group">
                  <label htmlFor="password">비밀번호 설정하기</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력해주세요"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nickname">닉네임 설정하기</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임을 입력해주세요"
                  />
                </div>
                <button
                  className="signUpBtn"
                  type="submit"
                  disabled={!password || !confirmPassword || !nickname || password !== confirmPassword}
                >
                  회원가입
                </button>
              </>
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
