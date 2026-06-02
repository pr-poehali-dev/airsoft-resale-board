import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const IMG1 = "https://cdn.poehali.dev/projects/073f3d40-c452-4c4c-9110-284be112666b/files/e0dec8eb-7383-4350-a389-787553df16c7.jpg";
const IMG2 = "https://cdn.poehali.dev/projects/073f3d40-c452-4c4c-9110-284be112666b/files/59e98033-056f-4a07-ade2-784864b4417c.jpg";
const IMG3 = "https://cdn.poehali.dev/projects/073f3d40-c452-4c4c-9110-284be112666b/files/5174d064-67f2-4844-8a29-6cf5d2457979.jpg";

type Page = "listings" | "favorites" | "profile" | "messages" | "sellers" | "about" | "support" | "listing-detail";

const CATEGORIES = [
  { id: "all", label: "Все", icon: "LayoutGrid" },
  { id: "gear", label: "Снаряжение", icon: "Shield" },
  { id: "optics", label: "Оптика", icon: "Eye" },
  { id: "bb", label: "Шары и газ", icon: "Circle" },
  { id: "parts", label: "Запчасти", icon: "Settings" },
];

const LISTINGS = [
  {
    id: 1,
    title: "Tokyo Marui M4A1 MWS GBBR",
    price: 32000,
    condition: "Отличное",
    category: "rifles",
    location: "Москва",
    seller: "Алексей К.",
    sellerRating: 4.9,
    sellerDeals: 47,
    verified: true,
    image: IMG2,
    views: 312,
    description: "Продаю любимца. Полный сток, стреляет отлично. Использовался на 12 играх. Полный комплект, коробка, документы.",
    tags: ["GBB", "Tokyo Marui", "M4"],
  },
  {
    id: 2,
    title: "Тактический жилет 6094A + магпоучи",
    price: 8500,
    condition: "Хорошее",
    category: "gear",
    location: "Санкт-Петербург",
    seller: "Дмитрий В.",
    sellerRating: 4.7,
    sellerDeals: 23,
    verified: true,
    image: IMG1,
    views: 178,
    description: "Плитник 6094А реплика высокого качества. Комплектуется 6 магпоучами под M4.",
    tags: ["6094", "Плитник", "MOLLE"],
  },
  {
    id: 3,
    title: "Страйкбольная маска + шлем",
    price: 4200,
    condition: "Хорошее",
    category: "gear",
    location: "Казань",
    seller: "Иван М.",
    sellerRating: 5.0,
    sellerDeals: 8,
    verified: false,
    image: IMG3,
    views: 94,
    description: "Полный фейс маска + FAST шлем. Совместимы, продаю комплектом.",
    tags: ["Маска", "Шлем", "Защита"],
  },
  {
    id: 4,
    title: "VFC HK416D GBBR",
    price: 58000,
    condition: "Новое",
    category: "rifles",
    location: "Екатеринбург",
    seller: "Сергей П.",
    sellerRating: 4.8,
    sellerDeals: 61,
    verified: true,
    image: IMG2,
    views: 521,
    description: "Куплен месяц назад, сделал 0 выстрелов. Продаю из-за смены хобби.",
    tags: ["VFC", "HK416", "GBB", "Новое"],
  },
  {
    id: 5,
    title: "Бинокль тактический 2.5x50",
    price: 12000,
    condition: "Хорошее",
    category: "optics",
    location: "Новосибирск",
    seller: "Кирилл Н.",
    sellerRating: 4.6,
    sellerDeals: 15,
    verified: true,
    image: IMG1,
    views: 203,
    description: "Бинокль в отличном состоянии. Оптика чистая, корпус без царапин.",
    tags: ["Оптика", "Бинокль"],
  },
  {
    id: 6,
    title: "Магазины HI-CAP M4 — 5шт",
    price: 1800,
    condition: "Хорошее",
    category: "magazines",
    location: "Ростов-на-Дону",
    seller: "Артём С.",
    sellerRating: 4.5,
    sellerDeals: 32,
    verified: true,
    image: IMG3,
    views: 87,
    description: "5 хай-капов на М4, все в рабочем состоянии, пружины не ослаблены.",
    tags: ["Магазины", "M4", "Hi-Cap"],
  },
];

const TOP_SELLERS = [
  { name: "Сергей П.", deals: 61, rating: 4.8, verified: true, since: "2020" },
  { name: "Алексей К.", deals: 47, rating: 4.9, verified: true, since: "2021" },
  { name: "Артём С.", deals: 32, rating: 4.5, verified: true, since: "2021" },
  { name: "Дмитрий В.", deals: 23, rating: 4.7, verified: true, since: "2022" },
];

const MESSAGES = [
  { id: 1, user: "Алексей К.", text: "Привет! Ещё в продаже?", time: "14:32", unread: true, avatar: "А" },
  { id: 2, user: "Дмитрий В.", text: "Торг возможен?", time: "12:10", unread: false, avatar: "Д" },
  { id: 3, user: "Иван М.", text: "Спасибо за сделку!", time: "Вчера", unread: false, avatar: "И" },
];

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? "text-primary" : "text-muted-foreground/30"} style={{ fontSize: 10 }}>★</span>
    ))}
  </span>
);

export default function Index() {
  const { user, state: authState, error: authError, loginWithEsia, logout } = useAuth();
  const isAuth = authState === "authenticated";

  const [page, setPage] = useState<Page>("listings");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredListings = LISTINGS.filter((l) => {
    const catMatch = selectedCategory === "all" || l.category === selectedCategory;
    const searchMatch =
      searchQuery === "" ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return catMatch && searchMatch;
  });

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const openListing = (id: number) => {
    setSelectedListing(id);
    setPage("listing-detail");
  };

  const currentListing = LISTINGS.find((l) => l.id === selectedListing);

  const conditionColor = (c: string) => {
    if (c === "Новое") return "text-emerald-400";
    if (c === "Отличное") return "text-sky-400";
    return "text-amber-400";
  };

  const navItems = [
    { id: "listings", label: "Объявления", icon: "LayoutGrid" },
    { id: "favorites", label: "Избранное", icon: "Heart" },
    { id: "messages", label: "Сообщения", icon: "MessageCircle" },
    { id: "sellers", label: "Продавцы", icon: "Award" },
    { id: "profile", label: "Профиль", icon: "User" },
  ];

  return (
    <div className="min-h-screen tactical-bg">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => { setPage("listings"); setSelectedListing(null); setMobileMenu(false); }}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-7 h-7 bg-primary flex items-center justify-center">
              <Icon name="Crosshair" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold tracking-widest uppercase text-foreground">
              Хопап
            </span>
          </button>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage("listings"); }}
              placeholder="Поиск снаряжения..."
              className="pl-9 h-9 bg-secondary border-border text-sm"
            />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id as Page)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  page === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.id === "messages" && MESSAGES.some((m) => m.unread) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
                <Icon name={item.icon as "LayoutGrid"} size={14} />
                <span className="uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Auth button — desktop */}
          <div className="hidden md:flex items-center shrink-0">
            {authState === "loading" ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isAuth && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-sm border border-border">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {(user.last_name || user.first_name || "П")[0]}
                  </div>
                  <span className="text-xs text-foreground">
                    {user.first_name || user.last_name || "Профиль"}
                  </span>
                  <span className="badge-verified text-[9px] px-1 py-0.5 rounded-sm font-medium">✓</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={15} />
                </button>
              </div>
            ) : (
              <Button
                onClick={loginWithEsia}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider text-xs h-8 px-3 gap-1.5"
              >
                <Icon name="Shield" size={13} />
                Войти через Госуслуги
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Icon name={mobileMenu ? "X" : "Menu"} size={20} />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              <div className="relative mb-3">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage("listings"); }}
                  placeholder="Поиск..."
                  className="pl-9 h-9 bg-secondary border-border text-sm"
                />
              </div>
              {[...navItems,
                { id: "about", label: "О платформе", icon: "Info" },
                { id: "support", label: "Поддержка", icon: "LifeBuoy" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id as Page); setMobileMenu(false); }}
                  className={`flex items-center gap-3 w-full px-2 py-2.5 text-sm rounded-sm transition-colors ${
                    page === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon name={item.icon as "User"} size={16} />
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-border mt-2">
                {isAuth && user ? (
                  <button
                    onClick={() => { logout(); setMobileMenu(false); }}
                    className="flex items-center gap-3 w-full px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-sm transition-colors"
                  >
                    <Icon name="LogOut" size={16} />
                    Выйти ({user.first_name || user.last_name})
                  </button>
                ) : (
                  <button
                    onClick={() => { loginWithEsia(); setMobileMenu(false); }}
                    className="flex items-center gap-3 w-full px-2 py-2.5 text-sm text-primary font-medium rounded-sm transition-colors hover:bg-secondary"
                  >
                    <Icon name="Shield" size={16} />
                    Войти через Госуслуги
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">

        {/* ===== LISTINGS ===== */}
        {page === "listings" && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-sm border border-border mb-6 bg-card">
              <div className="absolute inset-0 opacity-15">
                <img src={IMG1} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>
              <div className="relative px-6 py-10 md:py-14">
                <p className="text-primary text-xs font-medium uppercase tracking-[0.25em] mb-2">
                  Страйкбольная барахолка
                </p>
                <h1 className="font-display text-3xl md:text-5xl font-semibold uppercase tracking-wide text-foreground mb-3 leading-tight">
                  Страйкбольное<br />снаряжение<br />новое и б/у
                </h1>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Покупай и продавай снаряжение среди проверенных игроков.<br />
                  Реальные отзывы. Создаем надежную площадку для перепродажи.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider text-sm px-5 h-9">
                    <Icon name="Plus" size={15} className="mr-2" />
                    Разместить объявление
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-display uppercase tracking-wider text-sm h-9">
                    Как это работает
                  </Button>
                </div>

              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wide whitespace-nowrap border transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground bg-card"
                  }`}
                >
                  <Icon name={cat.icon as "LayoutGrid"} size={13} />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Примечание об оружии */}
            <div className="flex items-start gap-3 bg-card border border-primary/20 rounded-sm p-3 mb-4">
              <Icon name="Clock" size={15} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">Скоро:</span> категории «Приводы», «Пистолеты» и «Магазины» появятся в ближайшее время — пользователи смогут размещать объявления о продаже страйкбольного оружия.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm">
                Найдено: <span className="text-foreground font-medium">{filteredListings.length}</span>
              </p>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="SlidersHorizontal" size={13} />
                Фильтры
              </button>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display uppercase tracking-wide">Ничего не найдено</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing, i) => (
                  <div
                    key={listing.id}
                    className="bg-card border border-border rounded-sm overflow-hidden card-hover cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
                    onClick={() => openListing(listing.id)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <button
                        onClick={(e) => toggleFavorite(listing.id, e)}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm border border-border rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <Icon
                          name="Heart"
                          size={14}
                          className={favorites.includes(listing.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                        />
                      </button>
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs font-medium px-2 py-0.5 bg-background/80 backdrop-blur-sm border border-border/50 rounded-sm ${conditionColor(listing.condition)}`}>
                          {listing.condition}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-sm font-medium uppercase tracking-wide text-foreground leading-tight mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {listing.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-sm uppercase tracking-wide">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display text-xl text-primary font-semibold">
                          {listing.price.toLocaleString("ru-RU")} ₽
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="Eye" size={11} />
                          {listing.views}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                            {listing.seller[0]}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">{listing.seller}</span>
                          {listing.verified && (
                            <span className="badge-verified text-[9px] px-1 py-0.5 rounded-sm font-medium shrink-0">✓</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                          <Icon name="MapPin" size={10} />
                          {listing.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== LISTING DETAIL ===== */}
        {page === "listing-detail" && currentListing && (
          <div className="animate-fade-in">
            <button
              onClick={() => { setPage("listings"); setSelectedListing(null); }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
            >
              <Icon name="ArrowLeft" size={15} />
              Назад к объявлениям
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-[16/9] rounded-sm overflow-hidden border border-border bg-secondary">
                  <img src={currentListing.image} alt={currentListing.title} className="w-full h-full object-cover" />
                </div>
                <div className="bg-card border border-border rounded-sm p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentListing.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded-sm uppercase tracking-wide">
                        {t}
                      </span>
                    ))}
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-medium bg-secondary ${conditionColor(currentListing.condition)}`}>
                      {currentListing.condition}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wide font-semibold text-foreground mb-2">
                    {currentListing.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Icon name="MapPin" size={13} />{currentListing.location}</span>
                    <span className="flex items-center gap-1"><Icon name="Eye" size={13} />{currentListing.views} просмотров</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{currentListing.description}</p>
                </div>
                <div className="bg-card border border-border rounded-sm p-4 flex items-start gap-3">
                  <Icon name="ShieldCheck" size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Безопасная сделка</p>
                    <p className="text-xs text-muted-foreground">
                      Платформа рекомендует встречаться на нейтральной территории. Проверяйте снаряжение перед оплатой. Все продавцы проходят верификацию документов.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-sm p-5">
                  <div className="font-display text-3xl text-primary font-semibold mb-1">
                    {currentListing.price.toLocaleString("ru-RU")} ₽
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Торг уточняйте у продавца</p>
                  {isAuth ? (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider mb-2">
                      <Icon name="MessageCircle" size={15} className="mr-2" />
                      Написать продавцу
                    </Button>
                  ) : (
                    <Button
                      onClick={loginWithEsia}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider mb-2"
                    >
                      <Icon name="Shield" size={15} className="mr-2" />
                      Войти, чтобы написать
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-secondary font-display uppercase tracking-wider text-sm"
                    onClick={() => toggleFavorite(currentListing.id)}
                  >
                    <Icon
                      name="Heart"
                      size={14}
                      className={`mr-2 ${favorites.includes(currentListing.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {favorites.includes(currentListing.id) ? "В избранном" : "В избранное"}
                  </Button>
                </div>
                <div className="bg-card border border-border rounded-sm p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Продавец</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-display text-lg font-bold text-foreground">
                      {currentListing.seller[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">{currentListing.seller}</span>
                        {currentListing.verified && (
                          <span className="badge-verified text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase">✓ Верифицирован</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={currentListing.sellerRating} />
                        <span className="text-xs text-muted-foreground">{currentListing.sellerRating} · {currentListing.sellerDeals} сделок</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary rounded-sm p-3 text-center">
                      <div className="font-display text-xl text-foreground">{currentListing.sellerDeals}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Сделок</div>
                    </div>
                    <div className="bg-secondary rounded-sm p-3 text-center">
                      <div className="font-display text-xl text-foreground">{currentListing.sellerRating}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Рейтинг</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== FAVORITES ===== */}
        {page === "favorites" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-5 flex items-center gap-3">
              <Icon name="Heart" size={20} className="text-primary" />
              Избранное
            </h2>
            {favorites.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="Heart" size={44} className="mx-auto mb-3 opacity-20" />
                <p className="font-display uppercase tracking-wide">Пока нет избранных</p>
                <p className="text-sm mt-1 text-muted-foreground">Нажмите ❤ на объявлении, чтобы сохранить</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LISTINGS.filter((l) => favorites.includes(l.id)).map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-card border border-border rounded-sm overflow-hidden card-hover cursor-pointer"
                    onClick={() => openListing(listing.id)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                      <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => toggleFavorite(listing.id, e)}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 border border-border rounded-sm flex items-center justify-center"
                      >
                        <Icon name="Heart" size={14} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-sm uppercase tracking-wide text-foreground mb-2 line-clamp-2">{listing.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl text-primary font-semibold">{listing.price.toLocaleString("ru-RU")} ₽</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="MapPin" size={10} />{listing.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {page === "messages" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-5 flex items-center gap-3">
              <Icon name="MessageCircle" size={20} className="text-primary" />
              Сообщения
            </h2>
            <div className="max-w-2xl space-y-2">
              {MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-card border rounded-sm p-4 flex items-center gap-4 cursor-pointer transition-all hover:border-primary/40 ${
                    msg.unread ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-display text-base font-bold text-foreground shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${msg.unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.user}
                      </span>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className={`text-xs truncate ${msg.unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{msg.time}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-card border border-border rounded-sm">
                <p className="text-xs text-muted-foreground text-center">
                  Для отправки сообщений необходима регистрация
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== SELLERS ===== */}
        {page === "sellers" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-1 flex items-center gap-3">
              <Icon name="Award" size={20} className="text-primary" />
              Рейтинг продавцов
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Топ верифицированных продавцов платформы</p>
            <div className="max-w-3xl space-y-3">
              {TOP_SELLERS.map((seller, i) => (
                <div
                  key={seller.name}
                  className="bg-card border border-border rounded-sm p-5 flex items-center gap-5 card-hover cursor-pointer"
                >
                  <div className={`font-display text-2xl font-bold w-8 text-center shrink-0 ${
                    i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center font-display text-xl font-bold text-foreground shrink-0">
                    {seller.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-foreground">{seller.name}</span>
                      {seller.verified && (
                        <span className="badge-verified text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase">✓ Верифицирован</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>С {seller.since} г.</span>
                      <span>{seller.deals} сделок</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-xl text-primary font-semibold">{seller.rating}</div>
                    <div className="flex items-center justify-end mt-0.5">
                      <Stars rating={seller.rating} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="max-w-3xl mt-5 bg-card border border-border rounded-sm p-4 flex items-start gap-3">
              <Icon name="ShieldCheck" size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Верификация продавцов</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Верифицированные продавцы подтвердили личность через документы. Это добровольная процедура, повышающая доверие покупателей.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {page === "profile" && (
          <div className="animate-fade-in max-w-2xl">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-5 flex items-center gap-3">
              <Icon name="User" size={20} className="text-primary" />
              Профиль
            </h2>

            {/* Не авторизован */}
            {!isAuth ? (
              <div className="bg-card border border-border rounded-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                  <Icon name="User" size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-2">
                  Войдите в аккаунт
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Для размещения объявлений и общения с продавцами необходима авторизация через Госуслуги
                </p>
                {authError && (
                  <p className="text-xs text-destructive mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                    {authError}
                  </p>
                )}
                <Button
                  onClick={loginWithEsia}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider px-6"
                >
                  <Icon name="Shield" size={15} className="mr-2" />
                  Войти через Госуслуги
                </Button>
                <p className="text-[10px] text-muted-foreground mt-4">
                  Авторизация через ЕСИА — ваши данные защищены государственной системой
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-border rounded-sm p-6 mb-4">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center font-display text-2xl font-bold text-foreground">
                      {user ? (user.last_name || user.first_name || "П")[0] : "?"}
                    </div>
                    <div>
                      <h3 className="font-display text-xl uppercase tracking-wide text-foreground">
                        {user ? [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(" ") || "Пользователь" : "Пользователь"}
                      </h3>
                      {user?.member_since && (
                        <p className="text-xs text-muted-foreground mb-1">На платформе с {user.member_since} года</p>
                      )}
                      {user?.email && (
                        <p className="text-xs text-muted-foreground mb-1">{user.email}</p>
                      )}
                      <span className="badge-verified text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase">
                        ✓ Верифицирован через Госуслуги
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Сделок", value: "0" },
                      { label: "Рейтинг", value: "—" },
                      { label: "Отзывов", value: "0" },
                    ].map((s) => (
                      <div key={s.label} className="bg-secondary rounded-sm p-3 text-center">
                        <div className="font-display text-2xl text-primary font-semibold">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "Мои объявления", sub: "0 активных", icon: "LayoutGrid" },
                      { label: "История сделок", sub: "", icon: "History" },
                      { label: "Мои отзывы", sub: "", icon: "Star" },
                      { label: "Настройки", sub: "", icon: "Settings" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="w-full flex items-center justify-between p-3 rounded-sm hover:bg-secondary transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name={item.icon as "Star"} size={16} className="text-primary" />
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.sub && <span className="text-xs text-muted-foreground">{item.sub}</span>}
                          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider h-10">
                    <Icon name="Plus" size={15} className="mr-2" />
                    Разместить объявление
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary font-display uppercase tracking-wider h-10 px-4"
                    onClick={logout}
                  >
                    <Icon name="LogOut" size={15} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ABOUT ===== */}
        {page === "about" && (
          <div className="animate-fade-in max-w-3xl">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-5 flex items-center gap-3">
              <Icon name="Info" size={20} className="text-primary" />
              О платформе
            </h2>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-sm p-6">
                <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-3">Что такое Хопап?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Хопап — специализированная доска объявлений для покупки и продажи страйкбольного снаряжения, бывшего в употреблении. Мы создаём безопасное пространство для сделок между игроками.
                </p>
              </div>
              {[
                { icon: "ShieldCheck", title: "Верификация", text: "Продавцы добровольно проходят верификацию личности. Подтверждённые аккаунты получают значок и повышенное доверие покупателей." },
                { icon: "Star", title: "Рейтинг и отзывы", text: "После каждой сделки обе стороны оставляют отзывы. Рейтинг формируется честно — без накруток." },
                { icon: "Lock", title: "Безопасность сделок", text: "Рекомендуем встречаться на нейтральной территории, проверять снаряжение перед передачей денег и использовать безопасные методы оплаты." },
                { icon: "LayoutGrid", title: "Категории снаряжения", text: "Приводы, пистолеты, снаряжение, оптика, магазины, шары и газ, запчасти — всё что нужно страйкболисту." },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-sm p-5 flex items-start gap-4">
                  <Icon name={item.icon as "Star"} size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-display uppercase tracking-wide text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SUPPORT ===== */}
        {page === "support" && (
          <div className="animate-fade-in max-w-2xl">
            <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-5 flex items-center gap-3">
              <Icon name="LifeBuoy" size={20} className="text-primary" />
              Поддержка
            </h2>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-sm p-5">
                <h3 className="font-display uppercase tracking-wide text-foreground mb-4">Свяжитесь с нами</h3>
                <div className="space-y-4">
                  {[
                    { icon: "Mail", label: "Email", value: "support@strikmarket.ru" },
                    { icon: "MessageCircle", label: "Telegram", value: "@strikmarket_support" },
                    { icon: "Clock", label: "Время работы", value: "Пн–Пт, 10:00–19:00 МСК" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-sm flex items-center justify-center shrink-0">
                        <Icon name={c.icon as "Mail"} size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{c.label}</p>
                        <p className="text-sm text-foreground">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-sm p-5">
                <h3 className="font-display uppercase tracking-wide text-foreground mb-3">Частые вопросы</h3>
                {[
                  { q: "Как разместить объявление?", a: "Зарегистрируйтесь, нажмите «Разместить объявление», заполните форму и добавьте фотографии." },
                  { q: "Как пройти верификацию?", a: "Зайдите в Профиль → Верификация и следуйте инструкциям. Процесс занимает до 24 часов." },
                  { q: "Как безопасно провести сделку?", a: "Встречайтесь в публичном месте, проверяйте снаряжение перед оплатой, читайте отзывы о продавце." },
                ].map((faq) => (
                  <div key={faq.q} className="py-3 border-b border-border last:border-0">
                    <p className="text-sm font-medium text-foreground mb-1">{faq.q}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur-sm z-40">
        <div className="grid grid-cols-5 h-14">
          {[
            { id: "listings", icon: "LayoutGrid", label: "Лента" },
            { id: "favorites", icon: "Heart", label: "Избранное" },
            { id: "messages", icon: "MessageCircle", label: "Чаты" },
            { id: "sellers", icon: "Award", label: "Топ" },
            { id: "profile", icon: "User", label: "Профиль" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id as Page); setMobileMenu(false); }}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                page === item.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.id === "messages" && MESSAGES.some((m) => m.unread) && (
                <span className="absolute top-2.5 right-5 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
              <Icon name={item.icon as "User"} size={18} />
              <span className="text-[9px] uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Icon name="Crosshair" size={10} className="text-primary-foreground" />
            </div>
            <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">Хопап</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { id: "about", label: "О платформе" },
              { id: "support", label: "Поддержка" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id as Page)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Хопап</p>
        </div>
      </footer>
    </div>
  );
}