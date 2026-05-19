# CanvasBridge
해당 버전은 **불안정한** 상태이므로, 과제 제출 중 오류가 발생할 수 있습니다.
해당 프로그램을 사용할 경우 꼭 LMS에 같이 과제가 제출되었는지 확인해주세요.
혹여 예상치못한 피해가 발생할 경우 피해 보상이 제공되지 않으니 필시 확인 부탁드립니다.

## 🚀 프로젝트 개요
Canvas LMS는 웹 기반으로 제공되어 과제 확인 및 제출을 위해 브라우저를 별도로 사용해야 합니다.  
이 확장 프로그램은 이러한 불편함을 해결하기 위해, **VSCode 환경에서 과제 조회 및 제출을 직접 수행할 수 있도록 지원하는 Extension**입니다.
사용자는 VSCode 내에서 수강 과목 조회, 과제 확인, 과제 제출까지 한 번에 처리할 수 있습니다.


## ✨ 주요 기능
### 📖 수강 과목 조회
- VSCode 내에서 Canvas LMS에 등록된 수강 과목 목록을 확인할 수 있습니다.
- 강의를 선택하면 해강 강의의 과제 목록을 확인할 수 있습니다.

### 📝 과제 확인
- 선택한 강의의 과제 정보를 확인할 수 있습니다.
- 과제 이름, 마감일, 배점, 제출 방식 등의 정보를 제공합니다.

### 📤 과제 제출
- VSCode환경에서 바로 과제를 제출할 수 있습니다.
- 파일 업로드 기반 제출을 지원합니다.


## 👍 요구사항
이 확장 프로그램을 사용하려면 Canvas LMS토큰이 필요합니다.

### Canvas LMS 토큰 발행 방법
1. LMS로그인 후 계정>설정 탭 클릭
2. 승인된 통합>새 엑세스 토큰 버튼 클릭
3. 토큰 생성 버튼 클릭 (목적은 자유롭게 기재, 기한은 입력하지 않아도 됩니다)
   
<div>
    <img alt="retrieve token 1" src="resources/readme/retrieve_token_1.png" width="40%" />
    <img alt="retrieve token 2" src="resources/readme/retrieve_token_2.png" width="40%" />
    <img alt="retrieve token 3" src="resources/readme/retrieve_token_3.png" width="40%" />
    <img alt="retrieve token 4" src="resources/readme/retrieve_token_4.png" width="40%" />
</div>

### VSCode 토큰 설정 방법
1. VSCode 설정창(Ctrl+,) 열기
2. canvasbridge 검색 후 발행한 토큰 기입
3. Course view에서 refresh 클릭

<div>
    <img alt="set token 1" src="resources/readme/set_token_1.png" width="40%" />
    <img alt="set token 2" src="resources/readme/set_token_2.png" width="40%" />
    <img alt="set token 3" src="resources/readme/set_token_3.png" width="40%" />
</div>

## 😎 개발자
- [이지성](https://github.com/cocoquiet)
- [김혜진](https://github.com/Cocolabear)

## ⁉️ 문의 및 피드백
문제가 발생하거나 개선이 필요한 사항이 있다면 아래의 링크를 통해 문의해 주세요.
- GitHub 이슈 등록: [GitHub 이슈](https://github.com/ModakTeam/canvasbridge/issues)
- email : dev.jiseong@gmali.com