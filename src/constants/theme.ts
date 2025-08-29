// Constantes de tema para padronização visual do sistema

// Cores padronizadas
export const THEME_COLORS = {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    light: 'hsl(var(--primary) / 0.1)',
    border: 'hsl(var(--primary) / 0.2)'
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
    light: 'hsl(var(--secondary) / 0.5)'
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
    light: 'hsl(var(--muted) / 0.5)'
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))'
  },
  success: {
    DEFAULT: '#10b981',
    light: '#10b981 / 0.1'
  }
} as const;

// Ícones padronizados por contexto
export const THEME_ICONS = {
  workspace: {
    main: 'Building2',
    users: 'Users',
    settings: 'Settings'
  },
  document: {
    main: 'FileText',
    search: 'Search',
    download: 'Download',
    view: 'Eye',
    marker: 'Hash',
    bookmark: 'BookmarkPlus'
  },
  chat: {
    bot: 'Bot',
    user: 'User',
    message: 'MessageSquare',
    send: 'Send',
    copy: 'Copy',
    quote: 'Quote'
  },
  actions: {
    add: 'Plus',
    edit: 'Edit',
    delete: 'Trash2',
    close: 'X',
    expand: 'Maximize2',
    collapse: 'Minimize2',
    refresh: 'RefreshCw'
  },
  status: {
    loading: 'RefreshCw',
    success: 'CheckCircle',
    error: 'AlertCircle',
    warning: 'AlertTriangle'
  }
} as const;

// Tamanhos padronizados
export const THEME_SIZES = {
  icon: {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-10 w-10',
    '3xl': 'h-12 w-12'
  },
  avatar: {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  },
  button: {
    icon: 'h-6 w-6 p-0',
    iconSm: 'h-5 w-5 p-0'
  }
} as const;

// Espaçamentos responsivos padronizados
export const THEME_SPACING = {
  container: 'p-3 md:p-6',
  card: {
    padding: 'p-2 md:p-3',
    header: 'pb-2 md:pb-3'
  },
  gap: {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4',
    lg: 'gap-4 md:gap-6'
  },
  space: {
    sm: 'space-y-2 md:space-y-3',
    md: 'space-y-3 md:space-y-4',
    lg: 'space-y-4 md:space-y-6'
  }
} as const;

// Classes de texto responsivas
export const THEME_TEXT = {
  title: {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl'
  },
  body: {
    xs: 'text-xs md:text-sm',
    sm: 'text-sm',
    md: 'text-sm md:text-base'
  }
} as const;

// Variantes de componentes padronizadas
export const THEME_VARIANTS = {
  card: {
    default: 'bg-card text-card-foreground border',
    primary: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20',
    muted: 'bg-muted/50 border-muted'
  },
  badge: {
    status: {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    }
  }
} as const;

// Breakpoints responsivos
export const THEME_BREAKPOINTS = {
  mobile: {
    container: 'w-full',
    sidebar: 'w-full lg:w-80',
    maxWidth: 'max-w-[85%] md:max-w-[80%]'
  },
  desktop: {
    container: 'container mx-auto',
    sidebar: 'w-80',
    maxWidth: 'max-w-[80%]'
  }
} as const;