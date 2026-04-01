import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { FilterBar } from '@/components/FilterBar';
import { CallCard } from '@/components/CallCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchCalls, fetchCallAnalysis, Call } from '@/services/api';
