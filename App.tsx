
import { ArrowLeft, BarChart3, ChevronDown, Hash as HashIcon, Loader2, Search, TrendingUp, Video, Activity, Eye, ThumbsUp, MessageSquare, Clock, LayoutGrid, List, Download, Tag, Globe, Users, Sparkles, Flame, RefreshCcw, X, Check, Languages, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import AnalysisModal from './components/AnalysisModal';
import ChannelHeader from './components/ChannelHeader';
import DescriptionModal from './components/DescriptionModal';
import FormatChart from './components/FormatChart';
import MetricCard from './components/MetricCard';
import ResultsGrid from './components/ResultsGrid';
import ResultsTable from './components/ResultsTable';
import Sidebar from './components/Sidebar';
import ScoreChart from './components/ScoreChart';
import MetricDistributionChart from './components/MetricDistributionChart';
import UploadTimeline from './components/UploadTimeline';
import { analyzeWithGemini, summarizeVideo, translateTitles, translateKeywords } from './services/geminiService';
import { fetchChannelAnalysis, fetchYouTubeData, searchChannels } from './services/youtubeService';
import { ChannelInfo, RegionOption, SortOption, VideoResult } from './types';

const YT_KEY_STORAGE = 'yt_analyst_key';
const AI_KEY_STORAGE = 'ai_analyst_key';

const COUNTRIES = [
  { code: 'ALL', name: '전체 (Worldwide)', icon: '🌍' },
  { code: 'KR', name: '대한민국 (South Korea)', icon: '🇰🇷' },
  { code: 'US', name: '미국 (USA)', icon: '🇺🇸' },
  { code: 'JP', name: '일본 (Japan)', icon: '🇯🇵' },
  { code: 'IN', name: '인도 (India)', icon: '🇮🇳' },
  { code: 'GB', name: '영국 (UK)', icon: '🇬🇧' },
  { code: 'CA', name: '캐나다 (Canada)', icon: '🇨🇦' },
  { code: 'VN', name: '베트남 (Vietnam)', icon: '🇻🇳' },
  { code: 'ID', name: '인도네시아 (Indonesia)', icon: '🇮🇩' },
  { code: 'BR', name: '브라질 (Brazil)', icon: '🇧🇷' },
  { code: 'TH', name: '태국 (Thailand)', icon: '🇹🇭' },
  { code: 'DE', name: '독일 (Germany)', icon: '🇩🇪' },
  { code: 'FR', name: '프랑스 (France)', icon: '🇫🇷' },
  { code: 'RU', name: '러시아 (Russia)', icon: '🇷🇺' },
  { code: 'TW', name: '대만 (Taiwan)', icon: '🇹🇼' },
  { code: 'MX', name: '멕시코 (Mexico)', icon: '🇲🇽' },
  { code: 'AU', name: '호주 (Australia)', icon: '🇦🇺' },
];

const CATEGORIES = [
  { id: '', name: '전체 카테고리' },
  { id: '1', name: '영화/애니메이션' },
  { id: '2', name: '자동차' },
  { id: '10', name: '음악' },
  { id: '15', name: '반려동물/동물' },
  { id: '17', name: '스포츠' },
  { id: '19', name: '여행/이벤트' },
  { id: '20', name: '게임' },
  { id: '22', name: '인물/블로그' },
  { id: '23', name: '코미디' },
  { id: '24', name: '엔터테인먼트' },
  { id: '25', name: '뉴스/정치' },
  { id: '26', name: '노하우/스타일' },
  { id: '27', name: '교육' },
  { id: '28', name: '과학기술' }
];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [youtubeKey, setYoutubeKey] = useState<string>(() => localStorage.getItem(YT_KEY_STORAGE) || '');
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem(AI_KEY_STORAGE) || '');
  
  const [viewState, setViewState] = useState<'search' | 'channel'>('search');
  const [searchType, setSearchType] = useState<'video' | 'channel'>('video');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [channelData, setChannelData] = useState<{info: ChannelInfo, videos: VideoResult[]} | null>(null);
  const [channelSearchResults, setChannelSearchResults] = useState<ChannelInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'popularity' | 'views' | 'likes' | 'comments' | 'timeline' | 'format'>('popularity');

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionOption>('KR');
  const [category, setCategory] = useState<string>('');
  const [maxResults, setMaxResults] = useState<number>(20);
  const [results, setResults] = useState<VideoResult[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'short'>('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '', isAi: false });

  // Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

  // Custom Region Dropdown State
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    if (youtubeKey && results.length === 0 && viewState === 'search' && !loading) {
      triggerSearch('', maxResults);
    }
  }, [youtubeKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = async (searchQuery: string, limit: number) => {
    if (!youtubeKey) return alert('YouTube API 키를 사이드바에서 입력 후 저장해주세요.');
    setLoading(true);
    setViewState('search');
    // NOTE: 새로운 검색 시 기존 분석 결과 초기화
    setAiAnalysis(''); 
    
    try {
      if (searchType === 'video') {
        let data = await fetchYouTubeData(searchQuery, youtubeKey, region, limit, category);
        
        // 해외 영상이고 Gemini 키가 있으면 자동 번역 시도 (제목)
        if (data.length > 0 && region !== 'KR' && geminiKey) {
          setTranslating(true);
          try {
            data = await translateTitles(data, geminiKey);
          } catch (e) {
            console.error("Translation failed silently", e);
          } finally {
            setTranslating(false);
          }
        }

        setResults(data);
        setChannelSearchResults([]);

        // 트렌드 키워드(태그) 추출
        if (!searchQuery.trim()) {
           const allTags = data.flatMap(v => v.tags || []);
           const tagCounts = allTags.reduce((acc, tag) => {
             acc[tag] = (acc[tag] || 0) + 1;
             return acc;
           }, {} as Record<string, number>);
           
           const topTags = Object.entries(tagCounts)
             .filter(([tag]) => tag.length >= 2)
             .sort((a, b) => b[1] - a[1])
             .slice(0, 12)
             .map(([tag]) => tag);
             
           setTrendingTags(topTags);

           // 해외 지역이고 태그가 있으면 태그 번역 시도 (비동기 처리)
           if (region !== 'KR' && geminiKey && topTags.length > 0) {
              translateKeywords(topTags, geminiKey).then(translatedTags => {
                 setTrendingTags(translatedTags);
              }).catch(e => console.error("Tag translation error", e));
           }

        } else {
           setTrendingTags([]); 
        }
        
        // NOTE: 검색 직후 자동 분석 호출(analyzeWithGemini) 제거함. 사용자가 버튼을 클릭해야 분석함.

      } else {
        if (!searchQuery.trim()) {
           alert("채널 검색 시에는 검색어를 반드시 입력해야 합니다.");
           setLoading(false);
           return;
        }
        const channels = await searchChannels(searchQuery, youtubeKey, 12);
        setChannelSearchResults(channels);
        setResults([]);
        setAiAnalysis('');
      }
    } catch (err: any) { 
      console.error(err);
    } finally { 
      setLoading(false); 
      setAiLoading(false); 
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'channel' && !query.trim()) return;
    triggerSearch(query, maxResults);
  };

  const handleRunAnalysis = async () => {
    if (!geminiKey) return alert('AI 분석을 위해 사이드바에서 Gemini API 키를 입력해주세요.');
    if (results.length === 0) return alert('분석할 영상 데이터가 없습니다.');
    
    setAnalysisModalOpen(true);

    // 이미 분석된 결과가 있고 검색어가 바뀌지 않았다면 재사용 (여기서는 단순화를 위해 매번 호출하거나 상태 확인)
    if (!aiAnalysis) {
      setAiLoading(true);
      try {
        const categoryName = CATEGORIES.find(c => c.id === category)?.name;
        const analysis = await analyzeWithGemini(query, results, geminiKey, categoryName);
        setAiAnalysis(analysis);
      } catch (err: any) {
        setAiAnalysis('분석 중 오류가 발생했습니다: ' + err.message);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleKeywordClick = (tag: string) => {
    setQuery(tag);
    setSearchType('video');
    triggerSearch(tag, maxResults);
  };

  const handleReset = () => {
    setQuery('');
    setCategory('');
    triggerSearch('', maxResults);
  };

  const handleChannelAnalysis = async (channelId: string) => {
    if (!youtubeKey) return alert('YouTube API 키가 필요합니다.');
    setLoading(true);
    try {
      const data = await fetchChannelAnalysis(channelId, youtubeKey);
      setChannelData(data);
      setViewState('channel');
      setActiveTab('popularity');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVideoSummary = async (video: VideoResult) => {
    if (!geminiKey) return alert('AI 요약을 위해 사이드바에 Gemini API 키를 입력해주세요.');
    
    setModalContent({ 
      title: `${video.title} (AI 분석 중...)`, 
      description: 'Gemini 2.5 Flash 엔진이 영상을 분석 중입니다...', 
      isAi: true 
    });
    setModalOpen(true);
    try {
      const summary = await summarizeVideo(video.title, video.description, geminiKey);
      setModalContent({ title: video.title, description: summary, isAi: true });
    } catch (err: any) {
      setModalContent({ title: '오류', description: '요약 중 오류가 발생했습니다.', isAi: true });
    }
  };

  const handleSave = (type: 'yt' | 'ai') => {
    if (type === 'yt') {
      localStorage.setItem(YT_KEY_STORAGE, youtubeKey);
      alert('YouTube API 키가 저장되었습니다.');
      if (results.length === 0) triggerSearch('', maxResults);
    } else {
      localStorage.setItem(AI_KEY_STORAGE, geminiKey);
      alert('Gemini API 키가 저장되었습니다. 이제 AI 분석 기능을 사용할 수 있습니다.');
    }
  };

  const handleDelete = (type: 'yt' | 'ai') => {
    if (type === 'yt') {
      setYoutubeKey('');
      localStorage.removeItem(YT_KEY_STORAGE);
      alert('YouTube API 키가 삭제되었습니다.');
    } else {
      setGeminiKey('');
      localStorage.removeItem(AI_KEY_STORAGE);
      alert('Gemini API 키가 삭제되었습니다.');
    }
  };

  const isVideoShort = (v: VideoResult) => {
    return v.title.includes('#shorts') || v.tags.some(t => t.toLowerCase() === 'shorts') || v.duration.includes('PT59S') || v.duration.includes('PT40S');
  };

  const calculateScore = (v: VideoResult) => {
    const score = Math.floor((v.viewCount * 0.1 + v.likeCount + v.commentCount * 5) / 1000);
    return Math.min(score, 100);
  };

  const currentDisplayData = useMemo(() => {
    const data = viewState === 'channel' && channelData ? channelData.videos : results;
    let filtered = [...data];
    if (typeFilter === 'short') filtered = filtered.filter(isVideoShort);
    else if (typeFilter === 'video') filtered = filtered.filter(v => !isVideoShort(v));

    if (sortBy === 'views') return filtered.sort((a, b) => b.viewCount - a.viewCount);
    if (sortBy === 'likes') return filtered.sort((a, b) => b.likeCount - a.likeCount);
    if (sortBy === 'score') return filtered.sort((a, b) => calculateScore(b) - calculateScore(a));
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [results, channelData, viewState, sortBy, typeFilter]);

  const metrics = useMemo(() => {
    if (results.length === 0) return null;
    const totalViews = results.reduce((acc, curr) => acc + curr.viewCount, 0);
    const avgViews = totalViews / results.length;
    
    let competition = "보통";
    if (avgViews > 800000) competition = "매우 높음 (레드오션)";
    else if (avgViews > 300000) competition = "높음 (경쟁 치열)";
    else if (avgViews < 50000) competition = "낮음 (블루오션)";

    const tagFreq: Record<string, number> = {};
    results.flatMap(v => v.tags).forEach(tag => tagFreq[tag] = (tagFreq[tag] || 0) + 1);
    const topTag = Object.entries(tagFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || "없음";
    
    return { totalViews, competition, avgViews, topTag };
  }, [results]);

  const topScores = useMemo(() => {
    if (!channelData) return [];
    return [...channelData.videos]
      .sort((a, b) => calculateScore(b) - calculateScore(a))
      .slice(0, 20)
      .map(v => calculateScore(v));
  }, [channelData]);

  const viewsDist = useMemo(() => {
    if (!channelData) return [];
    return [...channelData.videos]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 20)
      .map(v => ({ label: v.title, value: v.viewCount }));
  }, [channelData]);

  const likesDist = useMemo(() => {
    if (!channelData) return [];
    return [...channelData.videos]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 20)
      .map(v => ({ label: v.title, value: v.likeCount }));
  }, [channelData]);

  const commentsDist = useMemo(() => {
    if (!channelData) return [];
    return [...channelData.videos]
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 20)
      .map(v => ({ label: v.title, value: v.commentCount }));
  }, [channelData]);

  const shortsCount = useMemo(() => (channelData?.videos || []).filter(isVideoShort).length, [channelData]);
  const normalCount = useMemo(() => (channelData?.videos || []).length - shortsCount, [channelData, shortsCount]);

  const tabs = [
    { id: 'popularity', label: '인기 점수', icon: Activity },
    { id: 'views', label: '조회수', icon: Eye },
    { id: 'likes', label: '좋아요', icon: ThumbsUp },
    { id: 'comments', label: '댓글', icon: MessageSquare },
    { id: 'timeline', label: '타임라인', icon: Clock },
    { id: 'format', label: '콘텐츠 포맷', icon: LayoutGrid },
  ];

  const handleExportCsv = () => {
    if (currentDisplayData.length === 0) return;
    const headers = ['제목', '원본제목', '채널', '구독자수', '조회수', '좋아요', '댓글', '인기점수', '게시일', 'URL'];
    const rows = currentDisplayData.map(v => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${(v.originalTitle || v.title).replace(/"/g, '""')}"`,
      `"${v.channelTitle.replace(/"/g, '""')}"`,
      v.subscriberCount || 0,
      v.viewCount,
      v.likeCount,
      v.commentCount,
      calculateScore(v),
      new Date(v.publishedAt).toLocaleDateString(),
      `https://www.youtube.com/watch?v=${v.id}`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `youtube_analysis_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlaceholder = () => {
    if (searchType === 'channel') return "검색할 채널명을 입력하세요...";
    const regionName = COUNTRIES.find(c => c.code === region)?.name.split('(')[0].trim() || '전체';
    if (category && !query) return `비워두면 '${regionName}' '${CATEGORIES.find(c => c.id === category)?.name}' 트렌드 분석`;
    return `키워드 입력 (비워두면 ${regionName} 실시간 트렌드)`;
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(regionSearch.toLowerCase()) || 
    c.code.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.code === region) || COUNTRIES[0];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-[#0f172a] transition-colors">
      <Sidebar 
        youtubeKey={youtubeKey} setYoutubeKey={setYoutubeKey}
        geminiKey={geminiKey} setGeminiKey={setGeminiKey}
        isDark={isDark} toggleTheme={() => setIsDark(!isDark)}
        onSave={handleSave} onDelete={handleDelete}
      />

      <main className="flex-1 p-6 md:p-8 md:ml-80">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {viewState === 'channel' && (
            <button onClick={() => setViewState('search')} className="flex items-center text-slate-500 hover:text-red-500 transition-colors font-bold text-sm mb-4 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 검색 결과로 돌아가기
            </button>
          )}

          {viewState === 'search' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors">
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex flex-col space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-1 flex-shrink-0">
                      <button 
                        type="button" onClick={() => setSearchType('video')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${searchType === 'video' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        영상 검색
                      </button>
                      <button 
                        type="button" onClick={() => setSearchType('channel')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${searchType === 'channel' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        채널 검색
                      </button>
                    </div>
                    <input
                      type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder={getPlaceholder()}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-red-500/20 flex-shrink-0">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />} 
                      {searchType === 'video' ? (query ? '키워드 분석' : '트렌드 분석') : '채널 검색'}
                    </button>
                    {(query || category) && (
                      <button 
                        type="button" 
                        onClick={handleReset}
                        className="px-4 py-3 bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center flex-shrink-0"
                        title="검색 초기화 및 트렌드 보기"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 z-20">
                    {/* Searchable Region Dropdown */}
                    <div className="relative group" ref={regionDropdownRef}>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsRegionOpen(!isRegionOpen);
                          setRegionSearch('');
                        }}
                        className={`flex items-center justify-between bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 min-w-[200px] transition-all ${isRegionOpen ? 'ring-2 ring-red-500' : ''}`}
                      >
                        <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white">
                          <Globe className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="mr-2">{selectedCountry.icon}</span>
                          <span className="truncate max-w-[140px]">{selectedCountry.name}</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {isRegionOpen && (
                        <div className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="p-2 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
                            <input 
                              type="text" 
                              value={regionSearch}
                              onChange={(e) => setRegionSearch(e.target.value)}
                              placeholder="국가 검색 (예: US, 일본)"
                              className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setRegion(country.code);
                                  setIsRegionOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${region === country.code ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                              >
                                <span className="mr-2 text-base">{country.icon}</span>
                                <span className="flex-1 text-left">{country.name}</span>
                                {region === country.code && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">검색 결과가 없습니다.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {searchType === 'video' && (
                      <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-red-500 transition-all">
                        <Tag className="w-4 h-4 text-slate-400 mr-2" />
                        <select 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)} 
                          className="bg-transparent py-2.5 text-gray-900 dark:text-white text-sm font-bold outline-none cursor-pointer"
                          style={{ colorScheme: isDark ? 'dark' : 'light' }}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-red-500 transition-all">
                      <List className="w-4 h-4 text-slate-400 mr-2" />
                      <select 
                        value={maxResults} 
                        onChange={(e) => setMaxResults(Number(e.target.value))} 
                        className="bg-transparent py-2.5 text-gray-900 dark:text-white text-sm font-bold outline-none cursor-pointer"
                      >
                        <option value={10} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">10개 보기</option>
                        <option value={20} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">20개 보기</option>
                        <option value={50} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">50개 보기</option>
                        <option value={100} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">100개 보기</option>
                      </select>
                    </div>
                  </div>
                </form>

                {/* 실시간 트렌드 키워드 영역 */}
                {trendingTags.length > 0 && !query && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="flex items-center text-sm font-black text-gray-900 dark:text-white mb-3">
                      <Flame className="w-4 h-4 text-red-500 mr-2" />
                      실시간 트렌드 키워드 ({selectedCountry.name.split('(')[0].trim()})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingTags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleKeywordClick(tag)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold text-slate-600 dark:text-slate-400 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {translating && (
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <Languages className="w-5 h-5 text-indigo-500 mr-3 animate-pulse" />
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">해외 영상 제목을 한국어로 번역하고 있습니다...</span>
             </div>
          )}

          {metrics && viewState === 'search' && searchType === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
              <MetricCard title="분석 시장 규모" value={metrics.totalViews.toLocaleString()} subtitle={`검색 결과 ${results.length}개 누적 조회수`} icon={BarChart3} iconBg="bg-blue-600" />
              <MetricCard title="시장 경쟁 강도" value={metrics.competition} subtitle={`영상당 평균 ${Math.round(metrics.avgViews).toLocaleString()}회`} icon={TrendingUp} iconBg="bg-red-600" />
              <MetricCard title="핵심 타겟팅 키워드" value={metrics.topTag} subtitle="현재 가장 인기 있는 태그" icon={HashIcon} iconBg="bg-indigo-600" />
            </div>
          )}

          {viewState === 'channel' && channelData && <ChannelHeader info={channelData.info} />}

          {viewState === 'channel' && (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-lg transition-colors">
              <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800 bg-[#1e293b]">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-8 py-4 text-xs font-black transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-8 bg-[#1e293b]">
                {activeTab === 'popularity' && <ScoreChart scores={topScores} />}
                {activeTab === 'views' && <MetricDistributionChart data={viewsDist} color="#3b82f6" />}
                {activeTab === 'likes' && <MetricDistributionChart data={likesDist} color="#ef4444" />}
                {activeTab === 'comments' && <MetricDistributionChart data={commentsDist} color="#22c55e" />}
                {activeTab === 'timeline' && <UploadTimeline videos={channelData?.videos || []} />}
                {activeTab === 'format' && <FormatChart shortsCount={shortsCount} videoCount={normalCount} />}
              </div>
            </div>
          )}

          {channelSearchResults.length > 0 && viewState === 'search' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channelSearchResults.map(channel => (
                <div key={channel.id} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:ring-2 hover:ring-red-500 transition-all cursor-pointer group" onClick={() => handleChannelAnalysis(channel.id)}>
                  {/* ... Channel card content ... */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-red-500 transition-colors">
                    <img src={channel.thumbnailUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{channel.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold">{channel.customUrl}</p>
                  </div>
                  {/* ... rest of channel card ... */}
                </div>
              ))}
            </div>
          )}

          {(results.length > 0 || (viewState === 'channel' && channelData)) && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-center bg-gray-50 dark:bg-[#111827] p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                    {viewState === 'search' && !query ? (
                      <>
                        <Flame className="w-5 h-5 mr-2 text-red-500" /> 
                        {category ? `'${CATEGORIES.find(c => c.id === category)?.name}' 트렌드` : '실시간 인기 급상승'}
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-2 text-red-600" /> 
                        {viewState === 'search' ? `'${query}' 분석 결과` : `${channelData?.info.title} 업로드 리스트`}
                      </>
                    )}
                    <span className="ml-2 text-slate-500 text-sm font-bold">({currentDisplayData.length}개)</span>
                  </h2>
                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                    {(['all', 'video', 'short'] as const).map(f => (
                      <button 
                        key={f} onClick={() => setTypeFilter(f)}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${typeFilter === f ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        {f === 'all' ? '전체' : f === 'video' ? '일반' : '쇼츠'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                   {/* AI Analyze Button Added Here */}
                   {viewState === 'search' && searchType === 'video' && geminiKey && (
                     <button 
                       onClick={handleRunAnalysis}
                       className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black flex items-center transition-all shadow-lg shadow-indigo-500/30 mr-2"
                     >
                       <Zap className="w-3.5 h-3.5 mr-1.5 fill-current" /> AI 심층 분석 실행
                     </button>
                   )}

                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 mr-2">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-white' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-white' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
                  </div>
                  <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-8 text-[10px] font-black text-gray-900 dark:text-white outline-none cursor-pointer">
                      <option value="score">🔥 인기 점수순</option>
                      <option value="views">👁️ 조회수순</option>
                      <option value="date">📅 최신순</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <button onClick={handleExportCsv} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-gray-600 dark:text-slate-300 hover:text-red-500 flex items-center transition-colors">
                    <Download className="w-3 h-3 mr-1.5" /> CSV 저장
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <ResultsGrid 
                  data={currentDisplayData} 
                  onSummaryClick={(v) => handleVideoSummary(v)}
                  onChannelAnalysis={handleChannelAnalysis}
                  currentType={typeFilter}
                />
              ) : (
                <ResultsTable 
                  data={currentDisplayData} 
                  onSummaryClick={(v) => handleVideoSummary(v)}
                  onChannelAnalysis={handleChannelAnalysis}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <DescriptionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title} description={modalContent.description} />
      
      {/* AI Analysis Modal */}
      <AnalysisModal 
        isOpen={analysisModalOpen} 
        onClose={() => setAnalysisModalOpen(false)} 
        content={aiAnalysis} 
        loading={aiLoading} 
      />
    </div>
  );
};

export default App;
