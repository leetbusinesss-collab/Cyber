import React, { useState, useRef } from "react";
import { 
  X, Download, Upload, FileCode, Check, AlertTriangle, PlayCircle, PlusCircle, Trash2, Copy, Sparkles 
} from "lucide-react";
import { GameState, Faction } from "../types";
import { formatSci } from "../utils/gameMath";

interface SavesHubProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onReset: () => void;
  onImportSaveState: (jsonText: string) => boolean;
  onModifyResource: (type: "energy" | "cores" | "points", value: number, setRaw?: boolean) => void;
  onLoadPreset: (presetIndex: number) => void;
}

export default function SavesHub({
  isOpen,
  onClose,
  gameState,
  onReset,
  onImportSaveState,
  onModifyResource,
  onLoadPreset,
}: SavesHubProps) {
  const [activeTab, setActiveTab] = useState<"file" | "tweaker">("file");
  const [pasteData, setPasteData] = useState("");
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handles export download action
  const handleExportFile = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cyber_realm_save_HE_${Math.floor(gameState.nanoEnergy)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setImportStatus({
        type: "success",
        message: "Файл резервного копирования со скачиванием сгенерирован успешно!",
      });
    } catch (e) {
      setImportStatus({
        type: "error",
        message: "Критическая ошибка создания резервной копии",
      });
    }
  };

  // Handles raw clipboard copying
  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(gameState));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
      setImportStatus({
        type: "error",
        message: "Буфер обмена заблокирован настройками приватности.",
      });
    }
  };

  // Handles choosing file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onImportSaveState(text);
      if (success) {
        setImportStatus({
          type: "success",
          message: "Профиль тестировщика успешно синхронизирован из файла!",
        });
        setPasteData("");
      } else {
        setImportStatus({
          type: "error",
          message: "Несовместимый файл сохранения. Нарушена структура.",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };

  // Handles pasting plain text data
  const handlePasteImport = () => {
    if (!pasteData.trim()) {
      setImportStatus({
        type: "error",
        message: "Поле ввода пусто. Пожалуйста, вставьте JSON-код сохранения.",
      });
      return;
    }

    const success = onImportSaveState(pasteData);
    if (success) {
      setImportStatus({
        type: "success",
        message: "Данные успешно импортированы из текстового буфера!",
      });
      setPasteData("");
    } else {
      setImportStatus({
        type: "error",
        message: "Ошибка расшифровки строки сохранения. Проверьте правильность JSON.",
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-[360px] h-[90%] bg-[#0c1017] border border-cyan-800/40 rounded-[32px] p-5 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden relative z-50">
        
        {/* Background micro grid element */}
        <div className="absolute inset-0 bg-scanline opacity-30 pointer-events-none rounded-[32px]" />

        {/* Modal Top Header Line */}
        <div className="relative flex items-center justify-between pb-3 border-b border-cyan-900/40 z-10 select-none">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xs font-black font-mono tracking-wider text-slate-100 uppercase">
                Режим Тестирования
              </h3>
              <p className="text-[9px] text-[#8b949e] font-mono leading-none mt-0.5">DEV_HUB // СОХРАНЕНИЯ</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800/80 hover:bg-cyan-950/40 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Control Panel */}
        <div className="relative flex bg-[#05070a] border border-cyan-950/50 rounded-xl p-1 justify-between select-none text-[10px] font-mono my-3 z-10 shrink-0">
          <button
            onClick={() => { setActiveTab("file"); setImportStatus(null); }}
            className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all duration-150 cursor-pointer ${
              activeTab === "file"
                ? "bg-[#0c1017] border border-cyan-900/30 text-cyan-400 shadow-inner"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            Сохранить / Файл
          </button>
          <button
            onClick={() => { setActiveTab("tweaker"); setImportStatus(null); }}
            className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all duration-150 cursor-pointer ${
              activeTab === "tweaker"
                ? "bg-[#0c1017] border border-cyan-900/30 text-cyan-400 shadow-inner"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            РЕДАКТОР СЕЙВА
          </button>
        </div>

        {/* Dynamic Modal Body Sheet */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 relative z-10 text-xs text-slate-300">
          
          {/* Status logs */}
          {importStatus && (
            <div className={`p-2.5 rounded-xl border mb-3 flex gap-2 items-start text-[10px] font-mono leading-snug animate-fadeIn ${
              importStatus.type === "success" 
                ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-950/10 border-rose-500/20 text-rose-400"
            }`}>
              {importStatus.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <span className="font-bold block uppercase">{importStatus.type === "success" ? "СВЯЗЬ НАСТРОЕНА" : "ОШИБКА ДЕКОДЕРА"}</span>
                {importStatus.message}
              </div>
            </div>
          )}

          {activeTab === "file" ? (
            /* File Import / Export Tab content */
            <div className="space-y-4">
              {/* Backups Export */}
              <div className="bg-[#05070a] border border-cyan-950/30 p-3 rounded-2xl">
                <h4 className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> 1. Экспорт Прогресса
                </h4>
                <p className="text-[9px] text-[#8b949e] font-mono leading-relaxed mb-3">
                  Скачайте ваш прогресс в виде файла сохранения формата JSON или скопируйте его код для бэкапа.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportFile}
                    className="flex items-center justify-center gap-1 bg-cyan-950/15 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 p-2.5 rounded-xl text-[9px] font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Файл .json
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2.5 rounded-xl text-[9px] font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Готово!" : "Код сейва"}
                  </button>
                </div>
              </div>

              {/* Backups Import */}
              <div className="bg-[#05070a] border border-cyan-950/30 p-3 rounded-2xl">
                <h4 className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> 2. Импорт файла сохранения
                </h4>
                <p className="text-[9px] text-[#8b949e] font-mono leading-relaxed mb-3">
                  Выберите файл сохранения `.json`, чтобы восстановить прогресс, или вставьте скопированную строку кода.
                </p>

                {/* File input click zone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 border-dashed p-3 rounded-xl text-[10px] font-mono uppercase font-bold tracking-wider mb-3 transition-colors duration-150 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Выбрать save-файл .json
                </button>

                {/* Manual Textbox Code entry */}
                <div className="space-y-1.5 mt-2">
                  <span className="text-[8px] font-mono uppercase text-[#8b949e]">ИЛИ вставьте текстовый сейв:</span>
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder='{"nanoEnergy": 25000, "singularityCores": 1...}'
                    className="w-full h-16 bg-[#0c1017] border border-cyan-950/40 rounded-xl p-2 font-mono text-[9px] text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500/30 resize-none leading-relaxed"
                  />
                  <button
                    onClick={handlePasteImport}
                    className="w-full bg-[#0d1620] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-950/60 font-mono text-[9px] uppercase font-bold py-1.5 rounded-lg tracking-wider transition-all cursor-pointer"
                  >
                    Загрузить скопированный код
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Resource manipulation and predefined save-states setup */
            <div className="space-y-4">
              
              {/* Presets setup */}
              <div className="bg-[#05070a] border border-cyan-950/30 p-3 rounded-2xl">
                <h4 className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Сборочные пресеты
                </h4>
                <p className="text-[9px] text-[#8b949e] font-mono leading-relaxed mb-3">
                  Мгновенно переключитесь на готовый сценарий игры для тестирования баланса.
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => onLoadPreset(0)}
                    className="w-full text-left bg-cyan-950/5 hover:bg-cyan-950/20 border border-cyan-950/30 p-2 rounded-xl flex items-center justify-between transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-slate-200 uppercase font-mono block">Пресет 1: Начало Дипломатии</span>
                      <span className="text-[8px] text-[#8b949e] font-mono">25к Энергии, 1 Ядро — Разблокирует Альянсы</span>
                    </div>
                    <PlayCircle className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => onLoadPreset(1)}
                    className="w-full text-left bg-cyan-950/5 hover:bg-cyan-950/20 border border-cyan-950/30 p-2 rounded-xl flex items-center justify-between transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-purple-400 uppercase font-mono block">Пресет 2: Расширенная Сеть</span>
                      <span className="text-[8px] text-[#8b949e] font-mono">5М Энергии, 15 Ядер, Производства автоматизированы</span>
                    </div>
                    <PlayCircle className="w-4 h-4 text-purple-400" />
                  </button>

                  <button
                    onClick={() => onLoadPreset(2)}
                    className="w-full text-left bg-rose-950/5 hover:bg-rose-950/20 border border-rose-950/20 p-2 rounded-xl flex items-center justify-between transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-rose-400 uppercase font-mono block">Пресет 3: Высший Сверхразум</span>
                      <span className="text-[8px] text-[#8b949e] font-mono">9.9 Триллиона Энергии, 1000 Ядер — Сверхсектор ИИ</span>
                    </div>
                    <PlayCircle className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              {/* Manual cheats panel */}
              <div className="bg-[#05070a] border border-cyan-950/30 p-3 rounded-2xl">
                <h4 className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" /> Тонкая Редакция Ресурсов
                </h4>
                <p className="text-[9px] text-[#8b949e] font-mono leading-relaxed mb-3">
                  Добавьте конкретные объемы субатомной энергии, синг-ядер или очков фракции прямо сейчас.
                </p>

                {/* Energy modifications */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center select-none text-[9px] font-mono text-slate-400">
                    <span>Нано-энергия (HЭ): {formatSci(gameState.nanoEnergy)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => onModifyResource("energy", 100000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +100K
                    </button>
                    <button
                      onClick={() => onModifyResource("energy", 50000000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +50M
                    </button>
                    <button
                      onClick={() => onModifyResource("energy", 100000000000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +100B
                    </button>
                    <button
                      onClick={() => onModifyResource("energy", 0, true)}
                      className="bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer border border-rose-955/20 animate-pulse"
                    >
                      Сброс
                    </button>
                  </div>
                </div>

                {/* Cores modifications */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center select-none text-[9px] font-mono text-slate-400">
                    <span>Ядра Сингулярности (ЯС): {gameState.singularityCores}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => onModifyResource("cores", 1)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +1 ЯС
                    </button>
                    <button
                      onClick={() => onModifyResource("cores", 50)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +50 ЯС
                    </button>
                    <button
                      onClick={() => onModifyResource("cores", 1000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +1000
                    </button>
                    <button
                      onClick={() => onModifyResource("cores", 0, true)}
                      className="bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer border border-rose-955/20 animate-pulse"
                    >
                      Сброс
                    </button>
                  </div>
                </div>

                {/* Faction Points modifications */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none text-[9px] font-mono text-slate-400">
                    <span>Очки Фракции (ОФ): {gameState.factionPoints.toFixed(0)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => onModifyResource("points", 500)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer"
                    >
                      +500 ОФ
                    </button>
                    <button
                      onClick={() => onModifyResource("points", 5000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer text-center whitespace-nowrap overflow-hidden"
                    >
                      +5K ОФ
                    </button>
                    <button
                      onClick={() => onModifyResource("points", 50000)}
                      className="bg-slate-900 hover:bg-slate-800 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer text-center"
                    >
                      +50К ОФ
                    </button>
                    <button
                      onClick={() => onModifyResource("points", 0, true)}
                      className="bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 text-[8px] font-mono p-1 rounded-md transition-colors cursor-pointer border border-rose-955/20 animate-pulse"
                    >
                      Сброс
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Outer safety warning text */}
        <div className="bg-[#05070a]/40 border border-cyan-950/20 p-2.5 rounded-2xl relative z-10 select-none shrink-0 mt-2">
          <p className="text-[8.5px] text-[#8b949e] font-mono leading-relaxed text-center">
            ПРИМЕЧАНИЕ: Любые загрузки save-файла перезапишут текущий локальный профиль в вашем веб-браузере. Пожалуйста, экспортируйте важные профили заранее.
          </p>
        </div>

      </div>
    </div>
  );
}
