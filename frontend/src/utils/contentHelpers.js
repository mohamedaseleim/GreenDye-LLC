import Language from '@mui/icons-material/Language';
import People from '@mui/icons-material/People';
import School from '@mui/icons-material/School';
import Security from '@mui/icons-material/Security';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Verified from '@mui/icons-material/Verified';

const ICONS={Language,People,School,Security,TrendingUp,Verified};
export const renderIcon=iconName=>{const IconComponent=ICONS[iconName]||School;return <IconComponent fontSize="large"/>};
export const getCurrentLang=i18n=>i18n.language==='ar'?'ar':i18n.language==='fr'?'fr':'en';
export const getLocalizedContent=(content,lang,fallback='')=>content?.[lang]||content?.en||fallback;
