import { useEffect } from "react";

// 실제 처리 방식과 어긋나면 안 된다. 수집 항목·외부 서비스·보관 기간을 바꾸면 이 문서도 고친다.
// 근거: users/models.py(회원 항목), api/v1/me.py(탈퇴 시 대화·북마크·크레딧 삭제),
// users/repositories.py(중복 지급 방지 해시, TTL 3일), search/service.py(IP는 메모리에서 1분),
// api/middleware.py(요청 로그의 검색어 q=***), 글꼴은 직접 제공(@fontsource),
// 서버는 Oracle Cloud 춘천 리전(ap-chuncheon-1).
const EFFECTIVE_DATE = "2026년 9월 27일";

const SECTIONS = [
  { id: "purpose", title: "처리 목적" },
  { id: "items", title: "처리하는 개인정보 항목과 수집 방법" },
  { id: "retention", title: "보유 기간" },
  { id: "third-party", title: "제3자 제공" },
  { id: "processors", title: "처리 위탁과 이용하는 외부 서비스" },
  { id: "transfer", title: "국외 이전" },
  { id: "destruction", title: "파기 절차와 방법" },
  { id: "rights", title: "이용자의 권리와 행사 방법" },
  { id: "security", title: "안전성 확보 조치" },
  { id: "storage", title: "쿠키와 브라우저 저장소" },
  { id: "children", title: "만 14세 미만 아동" },
  { id: "officer", title: "개인정보 보호책임자" },
  { id: "remedy", title: "권익침해 구제" },
  { id: "changes", title: "방침의 변경" },
];

function Section({ index, children }) {
  const { id, title } = SECTIONS[index];
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 flex items-baseline gap-2.5 text-lg font-bold text-ink sm:text-xl">
        <span className="font-mono text-sm text-accent-ink">{String(index + 1).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-7 text-ink-2">{children}</div>
    </section>
  );
}

function Table({ head, rows }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} className="border-b border-line bg-canvas px-3 py-2.5 font-semibold text-ink">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="align-top">
              {row.map((cell, c) => (
                <td key={c} className="border-b border-line px-3 py-2.5 text-ink-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const List = ({ items }) => (
  <ul className="list-disc space-y-1.5 pl-5">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="mx-auto w-full max-w-[1100px] py-6 sm:py-10">
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">개인정보처리방침</h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-2">
          Tech-Letter(이하 “서비스”)는 개인이 운영하는 기술 블로그 모음 서비스입니다. 서비스는 「개인정보 보호법」에 따라
          이용자의 개인정보를 처리하며, 어떤 정보를 왜, 어디에서, 얼마 동안 처리하는지 아래와 같이 알려 드립니다.
        </p>
        <p className="mt-2 font-mono text-sm text-ink-3">시행일 {EFFECTIVE_DATE}</p>
      </header>

      <nav aria-label="목차" className="mb-10 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ id, title }, i) => (
            <li key={id}>
              <a href={`#${id}`} className="flex gap-2 py-0.5 hover:underline">
                <span className="font-mono text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink-2">{title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        <Section index={0}>
          <p>서비스는 수집한 개인정보를 다음 목적으로만 처리합니다.</p>
          <List
            items={[
              "회원 식별과 로그인 유지",
              "북마크 저장, 챗봇·검색 결과 AI 요약 제공과 대화 기록 보관",
              "크레딧 지급·사용 관리와 같은 날 중복 지급 방지",
              "서비스 운영: 오류 분석, 과도한 요청 제한 등 부정 이용 방지",
            ]}
          />
          <p>서비스는 광고, 마케팅, 뉴스레터 발송을 하지 않으며 그 목적으로 개인정보를 처리하지 않습니다.</p>
        </Section>

        <Section index={1}>
          <Table
            head={["구분", "항목", "수집 방법"]}
            rows={[
              [
                "회원 가입·로그인 (필수)",
                "이메일 주소, 이름, Google 계정 고유 식별자",
                "Google 로그인 시 Google로부터 받음 (프로필 사진은 저장하지 않음)",
              ],
              [
                "서비스 이용 중 생성",
                "북마크 목록, 챗봇 대화 내용(질문·답변·참고한 글·사용한 모델·토큰 수·응답 시간), 크레딧 지급·사용 기록",
                "이용자가 기능을 사용할 때 생성",
              ],
              [
                "회원·비회원 공통 (자동)",
                "검색어, 접속 IP 주소, 웹 서버 접근 기록(요청 경로·시각·브라우저 정보·참조 페이지)",
                "서비스 이용 과정에서 자동 생성",
              ],
            ]}
          />
          <List
            items={[
              "검색어는 검색 결과를 만드는 동안에만 쓰고 저장하지 않습니다. 요청 기록에도 검색어는 가려서 남깁니다. 같은 검색어를 다시 처리하지 않도록 검색 의미 분석 결과를 서버 메모리에 최대 1시간 둘 수 있습니다.",
              "접속 IP 주소는 과도한 요청을 막기 위해 서버 메모리에서 1분 동안만 세고 저장하지 않습니다. 웹 서버 접근 기록에도 이용자의 실제 IP 주소는 남지 않습니다.",
              "글 조회수는 누가 봤는지 기록하지 않고 글마다 숫자만 올립니다.",
              "비밀번호는 받지 않습니다. 로그인은 Google 계정으로만 합니다.",
            ]}
          />
        </Section>

        <Section index={2}>
          <Table
            head={["항목", "보유 기간"]}
            rows={[
              ["회원 정보, 북마크, 크레딧 기록, 챗봇 대화", "회원 탈퇴 시 즉시 삭제. 챗봇 대화는 이용자가 대화 목록에서 언제든 개별 삭제 가능"],
              ["로그인으로 지급된 크레딧", "지급일 자정(UTC)에 만료되며 자동 삭제"],
              [
                "크레딧 중복 지급 방지 기록",
                "Google 계정 식별자를 복원할 수 없게 변환(해시)한 값과 마지막 지급 시각. 탈퇴 후 다시 가입해 같은 날 크레딧을 또 받는 것을 막기 위해 탈퇴 후에도 마지막 지급으로부터 최대 3일 보관한 뒤 자동 삭제",
              ],
              ["웹 서버 접근 기록", "정해진 용량을 넘으면 오래된 기록부터 자동 삭제"],
              [
                "운영 작업 전 백업",
                "데이터 정리·업그레이드 같은 작업 전에 백업을 만들 수 있으며, 가장 최근 것 하나만 두고 작업이 문제없음을 확인하면 삭제",
              ],
            ]}
          />
        </Section>

        <Section index={3}>
          <p>
            서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로 요청하는
            경우는 예외로 합니다.
          </p>
        </Section>

        <Section index={4}>
          <p>서비스는 운영을 위해 아래 외부 서비스를 이용합니다.</p>
          <Table
            head={["업체", "업무", "처리하는 정보"]}
            rows={[
              [
                "Oracle Corporation (Oracle Cloud Infrastructure)",
                "서버와 데이터베이스 운영. 대한민국 춘천 리전",
                "서비스가 저장하는 모든 정보(회원 정보, 북마크, 크레딧 기록, 챗봇 대화)",
              ],
              ["Google LLC", "Google 로그인", "로그인 과정의 계정 정보"],
              ["Google LLC (Gemini API)", "AI 요약·챗봇 답변 생성, 검색어 의미 분석", "국외 이전 항목 참고"],
              ["OpenRouter, Inc.", "AI 답변 생성 중계(여러 AI 모델 제공자 연결)", "국외 이전 항목 참고"],
            ]}
          />
          <p>
            글 목록의 썸네일 이미지는 원문 블로그 서버에서 바로 불러오므로, 이용자의 브라우저가 해당 블로그 서버에
            접속합니다. 원문 링크를 열었을 때 그 사이트에서의 개인정보 처리에는 이 방침이 적용되지 않습니다.
          </p>
        </Section>

        <Section index={5}>
          <p>챗봇, 검색 결과 AI 요약, 검색을 이용하면 아래 정보가 해외 AI 제공자에게 전송됩니다.</p>
          <Table
            head={["이전받는 자", "국가", "이전 항목", "시기와 방법", "목적", "보유 기간"]}
            rows={[
              [
                "Google LLC",
                "미국",
                "챗봇 질문과 이어지는 대화 맥락, 답변 근거로 쓰는 글 내용, 검색어",
                "기능을 쓸 때마다 암호화된 통신(HTTPS)으로 API 전송",
                "답변 생성, 검색어 의미 분석",
                "Google의 API 약관·정책에 따름",
              ],
              [
                "OpenRouter, Inc. 및 OpenRouter가 연결하는 AI 모델 제공자",
                "미국 등 모델 제공자 소재국",
                "챗봇 질문과 이어지는 대화 맥락, 답변 근거로 쓰는 글 내용",
                "기능을 쓸 때마다 암호화된 통신(HTTPS)으로 API 전송",
                "답변 생성",
                "OpenRouter와 각 모델 제공자의 약관·정책에 따름",
              ],
            ]}
          />
          <List
            items={[
              "이메일 주소, 이름 같은 회원 정보는 AI 제공자에게 보내지 않습니다.",
              "서비스는 무료 API 등급을 쓰는 경우가 있으며, 무료 등급에서는 제공자가 입력 내용을 자사 서비스 개선에 활용할 수 있습니다. 챗봇에 개인정보나 민감한 정보를 입력하지 마세요.",
              "국외 이전을 원하지 않으면 챗봇, AI 요약, 검색 기능을 쓰지 않으면 됩니다. 이 경우에도 글 목록 보기와 북마크는 이용할 수 있습니다.",
            ]}
          />
        </Section>

        <Section index={6}>
          <p>
            보유 기간이 끝나거나 처리 목적을 이루면 데이터베이스에서 지체 없이 삭제하며, 삭제한 정보는 복구할 수 없습니다.
            백업에 남아 있던 정보는 그 백업을 삭제할 때 함께 파기됩니다.
          </p>
        </Section>

        <Section index={7}>
          <p>이용자는 언제든 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요청할 수 있습니다.</p>
          <List
            items={[
              "회원 탈퇴: 계정 메뉴(모바일은 하단 더보기)의 설정에서 회원 탈퇴. 회원 정보, 북마크, 크레딧 기록, 챗봇 대화가 즉시 삭제됩니다.",
              "챗봇 대화 삭제: 챗봇의 대화 목록에서 대화별로 삭제",
              "그 밖의 요청: 아래 개인정보 보호책임자 이메일로 연락하면 지체 없이 처리합니다.",
            ]}
          />
        </Section>

        <Section index={8}>
          <List
            items={[
              "모든 통신은 암호화(HTTPS)합니다.",
              "데이터베이스는 인터넷에서 직접 접근할 수 없습니다. 서버 관리 도구는 허용한 IP에서만, 서비스 관리 기능은 관리자 권한 계정만 쓸 수 있습니다.",
              "로그인 상태는 서명된 토큰으로 확인하며, 비밀번호는 받거나 보관하지 않습니다.",
              "처리 목적에 필요한 최소한의 정보만 수집합니다.",
            ]}
          />
        </Section>

        <Section index={9}>
          <List
            items={[
              "로그인 상태 유지를 위해 브라우저 저장소(localStorage)에 로그인 토큰을 저장합니다. 화면 테마와 챗봇에서 고른 모델도 같은 곳에 저장합니다.",
              "Google 로그인 과정에서 위조 요청을 막기 위한 일회용 쿠키를 잠깐 사용합니다.",
              "브라우저 설정에서 쿠키와 사이트 데이터를 지우거나 차단할 수 있습니다. 이 경우 로그인이 필요한 기능은 쓸 수 없습니다.",
            ]}
          />
        </Section>

        <Section index={10}>
          <p>
            서비스는 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 미만 아동의 개인정보가 수집된 사실을 알게 되면
            즉시 삭제합니다.
          </p>
        </Section>

        <Section index={11}>
          <Table head={["구분", "내용"]} rows={[["이름", "김도형"], ["이메일", "dhkimxx@gmail.com"]]} />
        </Section>

        <Section index={12}>
          <p>개인정보 침해로 도움이 필요하면 아래 기관에 문의할 수 있습니다.</p>
          <List
            items={[
              "개인정보침해신고센터 (국번 없이) 118, privacy.kisa.or.kr",
              "개인정보분쟁조정위원회 1833-6972, www.kopico.go.kr",
              "대검찰청 (국번 없이) 1301, www.spo.go.kr",
              "경찰청 (국번 없이) 182, ecrm.police.go.kr",
            ]}
          />
        </Section>

        <Section index={13}>
          <p>
            이 방침은 {EFFECTIVE_DATE}부터 시행합니다. 내용이 바뀌면 시행 전에 이 페이지로 알립니다. 이전 방침(2026년 9월 24일
            시행)은 뉴스레터·결제처럼 서비스에 없는 기능을 담고 있어 실제 처리 방식에 맞게 다시 작성했습니다.
          </p>
        </Section>
      </div>
    </article>
  );
}
