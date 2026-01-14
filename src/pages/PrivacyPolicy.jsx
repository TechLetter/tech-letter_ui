import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../routes/path";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
          개인정보처리방침
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            <strong>Tech-Letter</strong>(이하 "운영자" 또는 "서비스")는
            정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등
            관련 법령을 준수하며, 이용자의 개인정보 보호를 위해 최선을 다하고
            있습니다.
            <br />
            <br />
            <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              본 방침은 2026년 1월 15일부터 시행됩니다.
            </span>
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                1
              </span>
              수집하는 개인정보 항목 및 방법
            </h2>
            <div className="pl-10 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  가. 수집 항목
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      1) 회원가입 및 이용 시 (필수)
                    </h4>
                    <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400 text-sm">
                      <li>
                        <strong>항목:</strong> 이메일 주소, 이름(또는 닉네임),
                        프로필 이미지, 소셜 로그인 식별자(Provider Sub)
                      </li>
                      <li>
                        <strong>목적:</strong> 회원 식별, 서비스 제공(뉴스레터,
                        채팅 등), 크레딧 관리
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      2) 서비스 이용 과정에서 자동 수집 (필수)
                    </h4>
                    <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400 text-sm">
                      <li>
                        <strong>항목:</strong> 접속 IP 정보, 쿠키, 서비스 이용
                        기록(북마크, 크레딧 내역), 접속 로그, 기기 정보
                      </li>
                      <li>
                        <strong>목적:</strong> 서비스 제공 및 운영, 부정 이용
                        방지, 오류 분석
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      3) 선택 수집 (동의 시)
                    </h4>
                    <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400 text-sm">
                      <li>
                        <strong>항목:</strong> 관심 카테고리, 선호 블로그 /{" "}
                        <strong>목적:</strong> 맞춤형 콘텐츠 추천
                      </li>
                      <li>
                        <strong>항목:</strong> 뉴스레터 수신 동의 /{" "}
                        <strong>목적:</strong> 이메일 뉴스레터 발송
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  나. 수집 방법
                </h3>
                <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                  <li>
                    홈페이지 및 앱 내 회원가입(Google OAuth), 서비스 이용
                    과정에서 생성정보 수집 툴을 통한 수집
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                2
              </span>
              개인정보의 이용 목적
            </h2>
            <div className="pl-10">
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                운영자는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
              </p>
              <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                <li>
                  서비스 제공 및 계약 이행 (뉴스레터 발송, AI 요약/챗봇 제공)
                </li>
                <li>회원 관리 (본인확인, 부정이용 방지, 민원처리)</li>
                <li>
                  신규 서비스 개발 및 마케팅 (통계 분석, 맞춤 서비스 제공)
                </li>
                <li>
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    AI 모델 활용
                  </strong>
                  : 서비스 품질 향상을 위한 <strong>통계 분석 목적의</strong>{" "}
                  익명화된 데이터 활용
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                3
              </span>
              개인정보의 보유 및 이용 기간
            </h2>
            <div className="pl-10 space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당
                정보를 지체 없이 파기합니다.
              </p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  1) 내부 방침에 의한 정보 보유
                </h3>
                <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                  <li>
                    <strong>회원 탈퇴 시:</strong>{" "}
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      지체 없이 파기
                    </span>{" "}
                    (단, 재가입 방지 등을 위해 소셜 로그인 식별자는 해시화하여
                    보관할 수 있음)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  2) 관련 법령에 의한 정보 보유
                </h3>
                <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                  <li>
                    <strong>통신비밀보호법:</strong> 로그인 기록 (3개월)
                  </li>
                  <li>
                    <strong>
                      전자상거래 등에서의 소비자 보호에 관한 법률:
                    </strong>
                    <ul className="list-circle list-outside ml-4 mt-1 space-y-1 text-sm">
                      <li>계약 또는 청약철회 등에 관한 기록 (5년)</li>
                      <li>대금결제 및 재화 등의 공급에 관한 기록 (5년)</li>
                      <li>소비자의 불만 또는 분쟁처리에 관한 기록 (3년)</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                4
              </span>
              개인정보의 파기 절차 및 방법
            </h2>
            <div className="pl-10">
              <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                <li>
                  <strong>절차:</strong> 목적 달성 후 내부 방침 및 기타 관련
                  법령에 따라 일정 기간 저장된 후 파기
                </li>
                <li>
                  <strong>방법:</strong> 전자적 파일 형태는 기술적 방법을
                  사용하여 삭제 (복구 불가)
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                5
              </span>
              개인정보 처리 위탁 및 국외 이전
            </h2>
            <div className="pl-10 space-y-6">
              <p className="text-slate-600 dark:text-slate-400">
                운영자는 서비스 향상을 위해 아래와 같이 외부 전문 업체에
                개인정보 처리를 위탁하고 있으며, 일부 정보는 국외로 이전될 수
                있습니다.
              </p>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  가. 개인정보 처리 위탁
                </h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                          수탁 업체
                        </th>
                        <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                          위탁 업무 내용
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                          이메일 발송 업체 (추후 도입 시 명시)
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                          뉴스레터 및 안내 메일 발송
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  나. 국외 이전 (AI API 등)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  서비스 핵심 기능인 AI 요약 및 챗봇 제공을 위해 아래와 같이
                  국외로 데이터가 전송됩니다.
                </p>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          이전받는 자
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          이전 국가
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          이전 항목
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          이전 일시 및 방법
                        </th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          이용 목적 및 기간
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          OpenAI
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">미국</td>
                        <td className="px-4 py-3">질문(Query), 포스트 본문</td>
                        <td className="px-4 py-3">API 호출 시 네트워크 전송</td>
                        <td className="px-4 py-3">
                          AI 답변 생성 / 처리 후 즉시 삭제 또는 정책 따름
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          Google (Gemini)
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">미국</td>
                        <td className="px-4 py-3">질문(Query), 포스트 본문</td>
                        <td className="px-4 py-3">API 호출 시 네트워크 전송</td>
                        <td className="px-4 py-3">
                          AI 답변 생성 / 처리 후 즉시 삭제 또는 정책 따름
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-500 italic">
                  * 위탁받은 업체는 해당 목적 달성을 위해서만 개인정보를
                  처리하며, 관계 법령에 따라 안전하게 관리됩니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                6
              </span>
              이용자 및 법정대리인의 권리
            </h2>
            <div className="pl-10">
              <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                <li>
                  이용자는 언제든지 자신의 개인정보를 열람, 수정, 삭제(회원
                  탈퇴) 요청할 수 있습니다.
                </li>
                <li>뉴스레터 수신 동의를 철회할 수 있습니다.</li>
                <li>문의: 아래 개인정보 보호책임자 이메일</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                7
              </span>
              개인정보의 안전성 확보 조치
            </h2>
            <div className="pl-10">
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                운영자는 이용자의 개인정보 보호를 위해 다음과 같은 조치를 취하고
                있습니다.
              </p>
              <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                <li>
                  <strong>관리적 조치:</strong> 내부관리계획 수립·시행, 개인정보
                  취급 최소화
                </li>
                <li>
                  <strong>기술적 조치:</strong> 개인정보 암호화(전송 구간 등),
                  보안 프로그램 설치 및 갱신, 접근통제
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                8
              </span>
              개인정보 자동 수집 장치의 설치·운영 및 거부
            </h2>
            <div className="pl-10">
              <ul className="list-disc list-outside ml-4 text-slate-600 dark:text-slate-400">
                <li className="mb-1">
                  <strong>쿠키 사용:</strong> 이용자에게 빠른 웹 환경을
                  제공하고, 로그인 상태를 유지하기 위해 쿠키를 사용합니다.
                </li>
                <li>
                  <strong>거부 방법:</strong> 웹 브라우저 설정을 통해 쿠키
                  저장을 거부할 수 있습니다. (단, 로그인이 필요한 일부 서비스
                  이용에 어려움이 있을 수 있습니다.)
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                9
              </span>
              개인정보 보호책임자
            </h2>
            <div className="ml-10 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl inline-block">
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-semibold w-20 inline-block">이름:</span>{" "}
                김도형
              </p>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                <span className="font-semibold w-20 inline-block">이메일:</span>{" "}
                <a
                  href="mailto:dhkimxx@gmail.com"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  dhkimxx@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">
                10
              </span>
              기타
            </h2>
            <div className="pl-10">
              <p className="text-slate-600 dark:text-slate-400">
                본 방침은 Tech-Letter 서비스에 적용되며, 링크된 다른
                웹사이트(타사 블로그 등)에서의 개인정보 수집에 대해서는 본
                방침이 적용되지 않습니다. 만 14세 미만 아동의 회원가입은 제한될
                수 있습니다.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to={PATHS.HOME}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
