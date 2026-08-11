import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
export default function LanguageSwitcher({ color='inherit' }) { const {t}=useTranslation(); const {language,changeLanguage}=useLanguage(); return <FormControl size="small" sx={{minWidth:122,'& .MuiInputLabel-root,& .MuiSelect-select,& .MuiSvgIcon-root':{color}}}><InputLabel id="language-label">{t('language')}</InputLabel><Select labelId="language-label" value={language} label={t('language')} onChange={e=>changeLanguage(e.target.value)}>{[['en','english'],['ar','arabic'],['fr','french']].map(([code,key])=><MenuItem key={code} value={code}>{t(key)}</MenuItem>)}</Select></FormControl> }
