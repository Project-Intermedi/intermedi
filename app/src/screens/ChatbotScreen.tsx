import { useState, useRef, useEffect } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { SendIcon } from '../components/Icons';

interface Msg { id: number; from: 'user' | 'ai'; text: string }

const AI_REPLIES: Record<string, string> = {
  '이 약은 어떤 약인가요?': '약의 이름이나 성분을 알려주시면 자세히 설명해드릴게요! 예를 들어 "아목시실린은 어떤 약인가요?" 처럼 물어보세요.',
  '이 약과 함께 먹어도 될까요?': '병용 가능 여부는 약의 성분에 따라 다를 수 있어요. 복용 중인 약 이름을 알려주시면 확인해드릴게요. 중요한 결정 전에는 꼭 의사나 약사와 상담하세요.',
  '부작용이 있나요?': '약마다 부작용이 다를 수 있어요. 어떤 약에 대해 궁금하신가요? 구체적인 약 이름을 알려주시면 주요 부작용을 설명해드릴게요.',
  '복용 시간을 놓쳤어요': '복용 시간을 놓치셨군요. 일반적으로 다음 복용 시간이 얼마 남지 않았다면 한 번 건너뛰고 다음 번에 정해진 용량만 복용하세요. 절대 두 배로 복용하지 마세요. 자세한 내용은 처방 의사나 약사에게 문의하세요.',
};

const FAQ = ['이 약은 어떤 약인가요?', '이 약과 함께 먹어도 될까요?', '부작용이 있나요?', '복용 시간을 놓쳤어요'];
let uid = 10;

export default function ChatbotScreen() {
  useNav();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: 'ai', text: '안녕하세요! 약에 대해 궁금한 점을 물어보세요.\n복용 방법, 부작용, 함께 먹어도 되는 약 등에 대해 설명해드릴게요.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { id: ++uid, from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const reply = AI_REPLIES[text] ?? (
        text.includes('아목시실린')
          ? '아목시실린은 세균 감염을 치료하는 항생제예요. 의사가 안내한 복용 기간을 지키는 것이 중요해요. 증상이 호전돼도 처방 기간 동안 꾸준히 복용하세요.'
          : text.includes('록소프로펜')
          ? '록소프로펜은 진통·소염 효과가 있는 약이에요. 위장 장애를 줄이기 위해 반드시 식후에 복용하세요.'
          : '좋은 질문이에요! 저는 일반적인 약 정보를 제공할 수 있지만, 정확한 진단이나 처방은 의료 전문가와 상담하시는 것이 가장 안전해요.'
      );
      setMessages(prev => [...prev, { id: ++uid, from: 'ai', text: reply }]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-4">
          <h1 className="text-[22px] font-black text-[#222222]">약 챗봇</h1>
          <p className="text-[12px] text-[#6B7280] mt-0.5">AI 기반 약 정보 안내 서비스</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-[#47795E] flex items-center justify-center flex-shrink-0 mr-2 self-end">
                <span className="text-white text-[12px] font-black">AI</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                m.from === 'user'
                  ? 'bg-[#47795E] text-white rounded-br-sm'
                  : 'bg-white text-[#222222] rounded-bl-sm shadow-sm'
              }`}
            >
              {m.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#47795E] flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-[12px] font-black">AI</span>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#AEBFB7] pulse-anim" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* FAQ suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FAQ.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="flex-shrink-0 bg-white rounded-full px-4 py-2 text-[12px] font-medium text-[#222222] border border-[#E8EDEB] shadow-sm active:bg-[#F4F7F6] transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 py-2 flex-shrink-0">
        <p className="text-[11px] text-[#AEBFB7] text-center">챗봇의 답변은 참고용이며 진단이나 처방을 대신하지 않습니다.</p>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E8EDEB] px-4 py-3 flex-shrink-0 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="궁금한 내용을 입력하세요..."
          className="flex-1 bg-[#F4F7F6] rounded-2xl px-4 py-3 text-[14px] text-[#222222] placeholder:text-[#AEBFB7] outline-none"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
            input.trim() && !loading ? 'bg-[#47795E] shadow-sm' : 'bg-[#E8EDEB]'
          }`}
        >
          <SendIcon size={18} className={input.trim() && !loading ? 'text-white' : 'text-[#AEBFB7]'} />
        </button>
      </div>

      <BottomNav active="chatbot" />
    </div>
  );
}
