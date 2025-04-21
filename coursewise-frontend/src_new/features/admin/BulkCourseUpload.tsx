import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  useToast,
  Text,
  Progress,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Input,
  HStack,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  Badge,
  Divider,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, ArrowBackIcon, DownloadIcon, AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
}

interface BulkCourseData {
  code: string;
  name: string;
  credits: number;
  stream_id: string;
  semester: number;
  description: string;
  instructor: string;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  prerequisites: string[];
  anti_requisites: string[];
  schedule: TimeSlot[];
}

interface ProcessedCourse {
  id: string;
  code: string;
  name: string;
  credits: number | null;
  stream_id: string | null;
  semester: number | null;
  description: string | null;
  instructor: string | null;
  department: string;
  status: string;
  prerequisites: string[] | null;
  anti_requisites: string[] | null;
  schedule: TimeSlot[] | null;
  created_by: string;
  updated_by: string;
}

const STREAMS = [
  { id: 'f757bad9-202e-44fc-8158-de439d8dbefe', name: 'All' },
  { id: '1160d7a4-30ef-4d8c-ab41-0e6317560dc3', name: 'Computer Science and AI' },
  { id: '5fc95cf3-e817-47c2-9c28-7a54f0f7e62a', name: 'Computer Science and Engineering' },
  { id: '63957879-1c1e-4797-b7df-fba74c54fd00', name: 'Electronics & Communication Engineering' },
  { id: '7f05302c-9b18-466f-875b-b820d532514c', name: 'Computer Science and Social Sciences' },
  { id: 'f5725c05-12ff-49f2-99f0-78235ccd08d3', name: 'Computer Science and Design' },
  { id: 'f3ff5d00-fe29-42c2-bbce-ea45c4cfa7bc', name: 'Computer Science and Biosciences' },
  { id: '220b0f53-1fc0-4a12-b6fc-1ec52ee6bfee', name: 'Electronics & VLSI Engineering' },
  { id: '5edaf761-abd3-4899-bf05-1d97286b7d44', name: 'Computer Science and Applied Mathematics' },
];

// Update the sample course with detailed instructions
const sampleCourse = {
  code: "CS101", // REQUIRED: Course code (uppercase letters and numbers only)
  name: "Introduction to Computer Science", // REQUIRED: Course name (any case)
  credits: 4, // REQUIRED: Number between 1-8
  stream_id: "1160d7a4-30ef-4d8c-ab41-0e6317560dc3", // REQUIRED: Use exact UUID from stream list
  semester: 1, // REQUIRED: Number between 1-8
  description: "An introductory course to computer science fundamentals", // Optional: Course description
  instructor: "Dr. John Doe", // Optional: Instructor name
  department: "", // LEAVE EMPTY: Will be auto-filled based on stream_id
  status: "active", // Optional: Must be exactly 'active', 'inactive', or 'archived' (lowercase)
  prerequisites: "MATH101,PHY101", // Optional: Comma-separated course codes (uppercase)
  anti_requisites: "CS102,CS103", // Optional: Comma-separated course codes (uppercase)
  // Format schedule as a JSON array string with exact property names
  schedule: JSON.stringify([
    {
      "day": "Monday", // Must be exactly: Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday
      "start_time": "09:00", // 24-hour format (HH:MM)
      "end_time": "10:30" // 24-hour format (HH:MM)
    },
    {
      "day": "Wednesday",
      "start_time": "09:00",
      "end_time": "10:30"
    }
  ], null, 2) // Pretty format for better readability in Excel
};

// Add stream information as a separate sheet
const streamInfo = {
  stream_id: "Available Stream IDs (Copy exactly as shown)",
  name: "Stream Name",
  "f757bad9-202e-44fc-8158-de439d8dbefe": "All",
  "1160d7a4-30ef-4d8c-ab41-0e6317560dc3": "Computer Science and AI",
  "5fc95cf3-e817-47c2-9c28-7a54f0f7e62a": "Computer Science and Engineering",
  "63957879-1c1e-4797-b7df-fba74c54fd00": "Electronics & Communication Engineering",
  "7f05302c-9b18-466f-875b-b820d532514c": "Computer Science and Social Sciences",
  "f5725c05-12ff-49f2-99f0-78235ccd08d3": "Computer Science and Design",
  "f3ff5d00-fe29-42c2-bbce-ea45c4cfa7bc": "Computer Science and Biosciences",
  "220b0f53-1fc0-4a12-b6fc-1ec52ee6bfee": "Electroncis & VLSI Engineering",
  "5edaf761-abd3-4899-bf05-1d97286b7d44": "Computer Science and Applied Mathematics"
};

const downloadTemplate = () => {
  // Create sample data with helpful instructions
  const sampleWithInstructions = {
    ...sampleCourse,
    _INSTRUCTIONS_: "Use this row as a template. Delete this field and copy the row for each course you want to add."
  };
  
  // Create main template sheet
  const ws = XLSX.utils.json_to_sheet([sampleWithInstructions]);
  
  // Add formatting and column widths
  ws['!cols'] = [
    { wch: 15 }, // code
    { wch: 40 }, // name
    { wch: 8 },  // credits
    { wch: 40 }, // stream_id
    { wch: 10 }, // semester
    { wch: 60 }, // description
    { wch: 20 }, // instructor
    { wch: 40 }, // department
    { wch: 10 }, // status
    { wch: 40 }, // prerequisites
    { wch: 40 }, // anti_requisites
    { wch: 100 }, // schedule
    { wch: 50 }  // instructions
  ];

  // Create stream info sheet with dynamic streams
  const wsStreams = XLSX.utils.json_to_sheet([streamInfo]);
  wsStreams['!cols'] = [
    { wch: 40 }, // stream_id
    { wch: 40 }  // name
  ];

  // Create a documentation sheet with detailed instructions
  const docContent = [
    { 
      section: "GENERAL INFORMATION",
      content: "This template is for bulk uploading courses to the CourseWise database."
    },
    { 
      section: "REQUIRED FIELDS",
      content: "code, name, credits, stream_id, and semester are required fields."
    },
    { 
      section: "SCHEDULE FORMAT",
      content: `The schedule must be a valid JSON array string with objects containing day, start_time, and end_time. Example: ${
        JSON.stringify([{ day: "Monday", start_time: "09:00", end_time: "10:30" }], null, 2)
      }`
    },
    { 
      section: "ARRAY FIELDS",
      content: "Prerequisites and anti-requisites should be comma-separated strings (e.g., 'CS101,MATH101')"
    },
    { 
      section: "DATA TYPES",
      content: "Credits and semester must be numbers. Stream_id must be a valid UUID from the Stream IDs sheet."
    },
    { 
      section: "COMMON ISSUES",
      content: "1. Make sure the schedule is a valid JSON string\n2. Verify semester is a number between 1-8\n3. Check that all required fields are filled"
    },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(docContent);
  wsInstructions['!cols'] = [
    { wch: 25 }, // section
    { wch: 120 } // content
  ];

  // Create example sheet with multiple sample courses
  const exampleCourses = [
    {
      code: "CS101",
      name: "Intro to CS",
      credits: 4,
      stream_id: "1160d7a4-30ef-4d8c-ab41-0e6317560dc3",
      semester: 1,
      prerequisites: "MATH101",
      schedule: JSON.stringify([{ day: "Monday", start_time: "09:00", end_time: "10:30" }])
    },
    {
      code: "CS201",
      name: "Data Structures",
      credits: 4,
      stream_id: "1160d7a4-30ef-4d8c-ab41-0e6317560dc3",
      semester: 2,
      prerequisites: "CS101,MATH101",
      schedule: JSON.stringify([
        { day: "Tuesday", start_time: "14:00", end_time: "15:30" },
        { day: "Thursday", start_time: "14:00", end_time: "15:30" }
      ])
    }
  ];
  const wsExamples = XLSX.utils.json_to_sheet(exampleCourses);
  
  // Create workbook with all sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.utils.book_append_sheet(wb, wsStreams, 'Stream IDs');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  XLSX.utils.book_append_sheet(wb, wsExamples, 'Examples');

  // Add styling to headers
  const applyHeaderStyling = (worksheet: any) => {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFE0E0E0" } }
    };
  }
  };
  
  applyHeaderStyling(ws);
  applyHeaderStyling(wsStreams);
  applyHeaderStyling(wsInstructions);
  applyHeaderStyling(wsExamples);

  XLSX.writeFile(wb, 'course_upload_template.xlsx');
};

// Add these validation functions before the BulkCourseUpload component
const validateStreamId = (streamId: string): string | null => {
  const validStream = STREAMS.find(s => s.id === streamId);
  return validStream ? null : 'Invalid stream ID. Please use a valid UUID from the streams list.';
};

const validateSchedule = (scheduleInput: string | any[]): string | null => {
  try {
    // Handle empty schedules - make them null instead of empty arrays
    if (!scheduleInput || scheduleInput === '') {
      return null;
    }
    
    let schedule;
    
    // Check if input is already an object/array (already parsed)
    if (typeof scheduleInput === 'object') {
      schedule = scheduleInput;
    } else {
      // Input is a string, try to parse it as JSON
      try {
        schedule = JSON.parse(scheduleInput);
      } catch (error) {
        // If parsing fails, it might not be valid JSON
        console.warn("Schedule parse error:", error);
        return `Invalid JSON format in schedule. Please make sure it's a valid JSON array.`;
      }
    }
    
    // Skip validation if schedule is null or empty
    if (!schedule || (Array.isArray(schedule) && schedule.length === 0)) {
      return null;
    }
    
    if (!Array.isArray(schedule)) {
      return 'Schedule must be an array of time slots';
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    // Make schedule optional - if we can't validate it properly, just treat it as empty
    // rather than failing the whole import
    let hasValidationErrors = false;

    for (const slot of schedule) {
      // Schedule structure validation
      if (typeof slot !== 'object' || slot === null) {
        console.warn("Invalid schedule slot:", slot);
        hasValidationErrors = true;
        continue; // Skip this slot
      }
      
      // Check if key properties exist
      // Allow different variations of property names
      const dayValue = slot.day || slot.Day || '';
      const startTime = slot.start_time || slot.startTime || slot['start time'] || slot['Start Time'] || slot['Start time'] || '';
      const endTime = slot.end_time || slot.endTime || slot['end time'] || slot['End Time'] || slot['End time'] || '';
      
      if (!dayValue || !validDays.includes(dayValue)) {
        console.warn(`Invalid day in schedule: ${dayValue}`);
        hasValidationErrors = true;
        continue;
      }
      
      // If start_time or end_time is missing, don't fail validation
      // just skip this schedule entry
      if (!startTime || !endTime) {
        console.warn(`Missing start_time or end_time in schedule`);
        hasValidationErrors = true;
        continue;
      }
      
      // Normalize time values
      const startTimeStr = String(startTime).trim();
      const endTimeStr = String(endTime).trim();
      
      if (!timeRegex.test(startTimeStr)) {
        console.warn(`Invalid start_time format: "${startTimeStr}"`);
        hasValidationErrors = true;
        continue;
      }
      
      if (!timeRegex.test(endTimeStr)) {
        console.warn(`Invalid end_time format: "${endTimeStr}"`);
        hasValidationErrors = true;
        continue;
      }
      
      // Store the correct values if they're valid
      slot.day = dayValue;
      slot.start_time = startTimeStr;
      slot.end_time = endTimeStr;
      
      // Remove camelCase versions to avoid duplication
      if (slot.startTime) delete slot.startTime;
      if (slot.endTime) delete slot.endTime;
    }
    
    if (hasValidationErrors) {
      // If there were errors but we don't want to fail the validation entirely,
      // we could return null here instead (making schedule optional)
      return null;
    }
    
    return null;
  } catch (error) {
    console.error("Schedule validation error:", error);
    // Make schedule optional by returning null instead of error
    return null;
  }
};

const validatePrerequisites = (prereqs: string | string[]): string | null => {
  if (!prereqs) return null;
  
  // Handle array input
  if (Array.isArray(prereqs)) {
    // Already an array, just check if it has any empty elements
    if (prereqs.some(c => !c.trim())) {
      return 'Invalid prerequisites format. Course codes should not contain empty values.';
    }
    return null;
  }
  
  // Handle string input
  const courses = prereqs.split(',').map(p => p.trim());
  if (courses.some(c => !c)) {
    return 'Invalid prerequisites format. Course codes should be comma-separated without empty values.';
  }
  return null;
};

const validateCourseData = (row: any, index: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!row.code) errors.push('Course code is required');
  if (!row.name) errors.push('Course name is required');
  if (!row.stream_id) errors.push('Stream ID is required');
  if (!row.semester) errors.push('Semester is required');

  // Field validations
  if (row.credits && (isNaN(row.credits) || row.credits < 0)) {
    errors.push('Credits must be a positive number');
  }

  if (row.semester && (isNaN(row.semester) || row.semester < 1 || row.semester > 8)) {
    errors.push('Semester must be between 1 and 8');
  }

  if (row.difficulty && !['Easy', 'Medium', 'Hard', null].includes(row.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, Hard, or empty');
  }

  if (row.status && !['active', 'inactive', 'archived'].includes(row.status)) {
    errors.push('Status must be active, inactive, or archived');
  }

  const streamError = validateStreamId(row.stream_id);
  if (streamError) errors.push(streamError);

  if (row.schedule) {
    try {
      // If it's an empty string or null, just skip validation
      if (row.schedule === null || row.schedule === '') {
        // Schedule is optional, so this is fine
      } else {
        // Handle both string and object inputs
    const scheduleError = validateSchedule(row.schedule);
    if (scheduleError) errors.push(scheduleError);
      }
    } catch (error) {
      // If we can't even validate it, just note that and continue
      console.warn(`Unable to validate schedule for row ${index + 2}:`, error);
      // Don't add an error - we'll treat this as a skip for the schedule
    }
  }

  // Check for both possible field names for prerequisites
  const prereqsField = row.prerequisites || row['pre-requisites'];
  if (prereqsField) {
    const prereqError = validatePrerequisites(prereqsField);
    if (prereqError) errors.push(prereqError);
  }

  // Check for both possible field names for anti-requisites
  const antiReqsField = row.anti_requisites || row['anti-requisites'];
  if (antiReqsField) {
    const antiReqError = validatePrerequisites(antiReqsField);
    if (antiReqError) errors.push(antiReqError);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(error => `Row ${index + 2}: ${error}`)
  };
};

const BulkCourseUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({
    success: [],
    errors: [],
  });
  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>([]);
  
  // New state variables for course verification
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);
  const [existingCourses, setExistingCourses] = useState<string[]>([]);
  const [newCourses, setNewCourses] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<'update_all' | 'add_new_only' | 'custom'>('update_all');
  const [customSelection, setCustomSelection] = useState<Record<string, boolean>>({});
  
  const toast = useToast();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data, error } = await supabase
          .from('streams')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setStreams(data || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch streams',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchStreams();
  }, []);

  // Update the validateStreamId function to use dynamic streams
  const validateStreamId = (streamId: string): string | null => {
    const validStream = streams.find(s => s.id === streamId);
    return validStream ? null : 'Invalid stream ID. Please use a valid UUID from the streams list.';
  };

  // Update the streamInfo object to use dynamic streams
  const getStreamInfo = () => {
    const info: any = {
      stream_id: "Available Stream IDs (Copy exactly as shown)",
      name: "Stream Name"
    };
    
    streams.forEach(stream => {
      info[stream.id] = stream.name;
    });

    return info;
  };

  const processExcelData = async (data: any[], userId: string): Promise<ProcessedCourse[]> => {
    console.log("=== STARTING EXCEL DATA PROCESSING ===");
    console.log("Raw data sample:", data.slice(0, 2));
    
    // Filter out empty rows - require at least code and name
    const validData = data.filter(row => row.code && row.name);
    console.log(`Found ${validData.length} valid rows with code and name`);
    
    // Validate all rows before processing
    const validationResults = validData.map((row, index) => validateCourseData(row, index));
    const allErrors = validationResults.flatMap(result => result.errors);
    
    if (allErrors.length > 0) {
      console.error("Validation errors:", allErrors);
      throw new Error(`Validation errors found:\n${allErrors.join('\n')}`);
    }
    
    // Process each valid row into the correct format for database insertion
    const processedData = validData.map(row => {
      console.log(`\n=== Processing course: ${row.code} ===`);
      
      // === 1. Process basic text and number fields ===
      const code = String(row.code).trim();
      const name = String(row.name).trim();
      
      // Handle credits (must be positive integer)
      let credits: number | null = null;
      if (row.credits !== undefined && row.credits !== null) {
        if (typeof row.credits === 'number') {
          credits = Math.round(Math.abs(row.credits));
        } else if (typeof row.credits === 'string') {
          const parsed = parseInt(row.credits.replace(/[^\d.-]/g, ''), 10);
          if (!isNaN(parsed)) {
            credits = Math.abs(parsed);
          }
        }
      }
      console.log(`Credits: ${credits}`);
      
      // Handle semester (must be integer 1-8)
      let semester: number | null = null;
      if (row.semester !== undefined && row.semester !== null) {
        if (typeof row.semester === 'number') {
          // Handle Excel date serial number issue
          let semValue = Math.round(row.semester);
          if (semValue > 8) {
            // Try modulo operations to extract a valid semester
            const mod10 = semValue % 10;
            if (mod10 >= 1 && mod10 <= 8) {
              semValue = mod10;
            } else {
              semValue = 1; // Default to 1 if all else fails
            }
          }
          semester = Math.min(Math.max(semValue, 1), 8); // Clamp between 1-8
        } else if (typeof row.semester === 'string') {
          const parsed = parseInt(row.semester.replace(/[^\d.-]/g, ''), 10);
          if (!isNaN(parsed)) {
            semester = Math.min(Math.max(parsed, 1), 8); // Clamp between 1-8
          } else {
            semester = 1; // Default if parsing fails
          }
        } else {
          semester = 1; // Default if missing
        }
      } else {
        semester = 1; // Default if missing
      }
      console.log(`Semester: ${semester}`);
      
      // Handle stream_id (must be UUID)
      let streamId = row.stream_id;
      // Validate stream ID format - must be UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!streamId || typeof streamId !== 'string' || !uuidPattern.test(streamId)) {
        console.warn(`Invalid stream_id format for ${code}: ${streamId}`);
        // Will be caught by validation before upload
      }
      
      // Find stream name for department
      const stream = streams.find(s => s.id === streamId);
      const department = stream ? stream.name : 'All';
      console.log(`Stream ID: ${streamId}, Department: ${department}`);
      
      // Handle optional text fields
      const description = row.description ? String(row.description).trim() : null;
      const instructor = row.instructor ? String(row.instructor).trim() : null;
      
      // Handle status (must be one of the allowed values)
      let status = 'active'; // Default
      if (row.status && typeof row.status === 'string') {
        const normalizedStatus = row.status.toLowerCase().trim();
        if (['active', 'inactive', 'archived'].includes(normalizedStatus)) {
          status = normalizedStatus;
        }
      }
      console.log(`Status: ${status}`);
      
      // === 2. Process array fields (prerequisites and anti-requisites) ===
      // This needs to handle various input formats and convert to string arrays
      
      let prerequisites: string[] | null = null;
      if (row.prerequisites) {
        if (Array.isArray(row.prerequisites)) {
          // Direct array - make sure all items are strings
          prerequisites = row.prerequisites.map((p: any) => String(p).trim()).filter(Boolean);
        } else if (typeof row.prerequisites === 'string') {
          // Comma-separated string
          prerequisites = row.prerequisites
            .split(',')
            .map((p: string) => p.trim())
            .filter(Boolean);
        } else {
          console.warn(`Unexpected prerequisites format for ${code}:`, row.prerequisites);
          prerequisites = [];
        }
      }
      console.log(`Prerequisites: ${prerequisites ? JSON.stringify(prerequisites) : 'null'}`);
      
      let antiRequisites: string[] | null = null;
      if (row.anti_requisites) {
        if (Array.isArray(row.anti_requisites)) {
          antiRequisites = row.anti_requisites.map((a: any) => String(a).trim()).filter(Boolean);
        } else if (typeof row.anti_requisites === 'string') {
          antiRequisites = row.anti_requisites
            .split(',')
            .map((a: string) => a.trim())
            .filter(Boolean);
        } else {
          console.warn(`Unexpected anti-requisites format for ${code}:`, row.anti_requisites);
          antiRequisites = [];
        }
      }
      console.log(`Anti-requisites: ${antiRequisites ? JSON.stringify(antiRequisites) : 'null'}`);
      
      // === 3. Process schedule (complex JSONB field) ===
      let schedule: TimeSlot[] | null = null;
      
      if (row.schedule) {
        console.log(`Processing schedule for ${code} - Type: ${typeof row.schedule}`);
        console.log(`Raw schedule value:`, row.schedule);
        
        try {
          let scheduleParsed;
          
          // Handle different input formats
          if (typeof row.schedule === 'string') {
            const cleanSchedule = row.schedule.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
            
            // Try to parse as JSON
            try {
              scheduleParsed = JSON.parse(cleanSchedule);
              console.log(`Successfully parsed schedule JSON:`, scheduleParsed);
            } catch (parseError) {
              // If parsing fails, attempt to repair common Excel JSON formatting issues
              console.warn(`JSON parse error for ${code}:`, parseError);
              console.log(`Attempting to repair schedule JSON`);
              
              let repairAttempt = cleanSchedule;
              
              // Replace single quotes with double quotes
              repairAttempt = repairAttempt.replace(/'/g, '"');
              
              // Add quotes around unquoted keys (common Excel issue)
              repairAttempt = repairAttempt.replace(/({|,)\s*(\w+)\s*:/g, '$1"$2":');
              
              try {
                scheduleParsed = JSON.parse(repairAttempt);
                console.log(`Repaired and parsed schedule:`, scheduleParsed);
              } catch (finalError) {
                console.error(`JSON repair failed for ${code}:`, finalError);
                // Default to empty schedule rather than null
                scheduleParsed = [];
              }
            }
          } else if (Array.isArray(row.schedule)) {
            // Use array directly
            scheduleParsed = [...row.schedule];
            console.log(`Using direct array for schedule:`, scheduleParsed);
          } else if (typeof row.schedule === 'object' && row.schedule !== null) {
            // Handle single object case by wrapping in array
            scheduleParsed = [row.schedule];
            console.log(`Wrapped single object in array:`, scheduleParsed);
          } else {
            console.warn(`Unexpected schedule format for ${code}:`, row.schedule);
            scheduleParsed = [];
          }
          
          // Validate and transform the schedule entries
          if (Array.isArray(scheduleParsed)) {
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            
            const validEntries = scheduleParsed
              .filter(item => item && typeof item === 'object')
              .map(slot => {
                // Normalize field names with flexible property access
                const rawDay = slot.day || slot.Day || '';
                const normalizedDay = String(rawDay).trim();
                
                // Normalize time formats with flexible property access - also handle camelCase variations
                const rawStartTime = slot.start_time || slot.startTime || slot['start time'] || slot['Start Time'] || slot['Start time'] || '';
                const rawEndTime = slot.end_time || slot.endTime || slot['end time'] || slot['End Time'] || slot['End time'] || '';
                
                const startTime = String(rawStartTime).trim();
                const endTime = String(rawEndTime).trim();
                
                // Validate day
                if (!normalizedDay || !validDays.includes(normalizedDay)) {
                  console.warn(`Invalid day in schedule: "${normalizedDay}"`);
                  return null;
                }
                
                // Validate times
                if (!startTime || !timeRegex.test(startTime)) {
                  console.warn(`Invalid start_time format: "${startTime}"`);
                  return null;
                }
                
                if (!endTime || !timeRegex.test(endTime)) {
                  console.warn(`Invalid end_time format: "${endTime}"`);
                  return null;
                }
                
                // Return normalized slot
      return {
                  day: normalizedDay,
                  start_time: startTime,
                  end_time: endTime
                };
              })
              .filter(Boolean) as TimeSlot[];
            
            if (validEntries.length > 0) {
              schedule = validEntries;
              console.log(`Final validated schedule for ${code} (${validEntries.length} slots):`, JSON.stringify(schedule));
            } else {
              // Empty but valid array instead of null
              schedule = [];
              console.log(`No valid schedule entries found for ${code}`);
            }
          } else {
            schedule = [];
            console.log(`Schedule is not an array for ${code}, defaulting to empty array`);
          }
        } catch (error) {
          console.error(`Error processing schedule for ${code}:`, error);
          schedule = [];
        }
      } else {
        console.log(`No schedule provided for ${code}`);
        schedule = [];
      }
      
      // Construct the final processed course object
      const processedCourse: ProcessedCourse = {
        id: code, // ID is the course code
        code,
        name,
        credits,
        stream_id: streamId,
        semester,
        description,
        instructor,
        department,
        status,
        prerequisites: prerequisites || [],
        anti_requisites: antiRequisites || [],
        schedule: schedule || [],
        created_by: userId,
        updated_by: userId
      };
      
      console.log(`Completed processing for ${code}`);
      return processedCourse;
    });
    
    console.log("=== EXCEL DATA PROCESSING COMPLETE ===");
    console.log(`Processed ${processedData.length} courses`);

    return processedData;
  };

  // New function to check for existing courses
  const checkExistingCourses = async (courseCodes: string[]) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('code')
        .in('code', courseCodes);
        
      if (error) {
        throw error;
      }
      
      return data.map(course => course.code);
    } catch (error) {
      console.error('Error checking existing courses:', error);
      return [];
    }
  };

  // Modified handleFileUpload to include verification step and better Excel preprocessing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setProgress(0);
    setResults({ success: [], errors: [] });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Error',
          description: 'Please login as admin first',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsVerifying(false);
        return;
      }

      console.log("=== STARTING EXCEL FILE PROCESSING ===");
      console.log("Reading file:", file.name);
      
      const workbook = XLSX.read(await file.arrayBuffer(), { 
        type: 'array',
        cellDates: true, // Parse dates correctly
        cellNF: false,   // Don't parse number formats
        cellText: false  // Don't generate text versions
      });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      console.log(`Reading sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with several options for best results
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,    // Convert all values to strings
        defval: null,  // Use null for empty cells
        blankrows: false  // Skip blank rows
      });
      
      console.log(`Found ${jsonData.length} rows in Excel file`);
      
      if (jsonData.length === 0) {
        toast({
          title: 'Empty File',
          description: 'The Excel file contains no data rows',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setIsVerifying(false);
        return;
      }
      
      // Log sample data for debugging (first row)
      console.log("Sample row from Excel:", JSON.stringify(jsonData[0], null, 2));
      
      // Pre-process all rows to handle Excel format issues
      const preprocessedData = jsonData.map((row: any, index: number) => {
        console.log(`\n--- Pre-processing row ${index + 2} (${row.code || 'no code'}) ---`);
        
        const processedRow = { ...row };
        
        // Map fields with different names
        if (row['pre-requisites'] !== undefined && processedRow.prerequisites === undefined) {
          processedRow.prerequisites = row['pre-requisites'];
          console.log(`Mapped pre-requisites to prerequisites: ${processedRow.prerequisites}`);
        }
        
        if (row['anti-requisites'] !== undefined && processedRow.anti_requisites === undefined) {
          processedRow.anti_requisites = row['anti-requisites'];
          console.log(`Mapped anti-requisites to anti_requisites: ${processedRow.anti_requisites}`);
        }
        
        // Process prerequisites and anti-requisites first
        ['prerequisites', 'anti_requisites'].forEach(field => {
          console.log(`Original ${field} (${typeof processedRow[field]}):`, processedRow[field]);
          
          // Handle different formats that might come from Excel
          if (processedRow[field]) {
            // If it's a string already, make sure it's properly formatted
            if (typeof processedRow[field] === 'string') {
              // Split by comma if it contains commas
              if (processedRow[field].includes(',')) {
                const items = processedRow[field].split(',')
                  .map((item: string) => item.trim())
                  .filter(Boolean);
                console.log(`Converted ${field} from comma-string to array:`, items);
                processedRow[field] = items;
              } else {
                // Single item, convert to array with one element
                processedRow[field] = [processedRow[field].trim()];
                console.log(`Converted ${field} from string to array:`, processedRow[field]);
              }
            } 
            // If it's already an array, make sure all elements are strings
            else if (Array.isArray(processedRow[field])) {
              processedRow[field] = processedRow[field]
                .map((item: any) => String(item).trim())
                .filter(Boolean);
              console.log(`Normalized ${field} array:`, processedRow[field]);
            }
            // Other formats, try to convert
            else {
              console.warn(`Unexpected ${field} format:`, processedRow[field]);
              // Try to convert to string and then to array
              try {
                const str = String(processedRow[field]);
                processedRow[field] = [str.trim()];
                console.log(`Converted ${field} to array:`, processedRow[field]);
              } catch (e) {
                console.error(`Could not convert ${field} to array:`, e);
                processedRow[field] = [];
              }
            }
          } else {
            // Ensure field exists as empty array
            processedRow[field] = [];
            console.log(`${field} not provided, set to empty array`);
          }
        });
        
        // Process schedule - the most complex field
        if (processedRow.schedule) {
          console.log(`Original schedule (${typeof processedRow.schedule}):`, processedRow.schedule);
          
          // Convert schedule to proper format
          try {
            // If it's a string, try to parse as JSON
            if (typeof processedRow.schedule === 'string') {
              let scheduleStr = processedRow.schedule.trim();
              
              // Check if it looks like valid JSON
              if ((scheduleStr.startsWith('[') && scheduleStr.endsWith(']'))) {
                // Try to parse the JSON
                try {
                  const parsedSchedule = JSON.parse(scheduleStr);
                  if (Array.isArray(parsedSchedule)) {
                    // Successfully parsed as array
                    processedRow.schedule = parsedSchedule;
                    console.log(`Parsed schedule JSON to array with ${parsedSchedule.length} items`);
                  } else {
                    // Parsed but not an array, wrap in array
                    processedRow.schedule = [parsedSchedule];
                    console.log(`Parsed schedule JSON to object, wrapped in array`);
                  }
                } catch (e) {
                  console.warn(`Failed to parse schedule JSON, attempting repairs:`, e);
                  
                  // Try to fix common JSON issues
                  // Replace single quotes with double quotes
                  let fixedStr = scheduleStr.replace(/'/g, '"');
                  // Add quotes around unquoted keys
                  fixedStr = fixedStr.replace(/({|,)\s*(\w+)\s*:/g, '$1"$2":');
                  
                  try {
                    const repaired = JSON.parse(fixedStr);
                    if (Array.isArray(repaired)) {
                      processedRow.schedule = repaired;
                      console.log(`Repaired and parsed schedule JSON to array:`, repaired);
                    } else {
                      processedRow.schedule = [repaired];
                      console.log(`Repaired and parsed schedule JSON to object, wrapped in array`);
                    }
                  } catch (finalError) {
                    console.error(`JSON repair failed, setting empty schedule:`, finalError);
                    processedRow.schedule = [];
                  }
                }
              } else {
                // Doesn't look like JSON, convert to default schedule format
                console.warn(`Schedule doesn't look like JSON array, trying to interpret`);
                
                // Check if it might be a single day/time entry
                const dayPattern = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i;
                const timePattern = /\b(\d{1,2}:\d{2})\b/;
                
                const dayMatch = scheduleStr.match(dayPattern);
                const timeMatches = scheduleStr.match(new RegExp(timePattern, 'g'));
                
                if (dayMatch && timeMatches && timeMatches.length >= 2) {
                  // Looks like a simple schedule entry with day and times
                  const day = dayMatch[0];
                  const startTime = timeMatches[0];
                  const endTime = timeMatches[1];
                  
                  const manualSchedule = [{
                    day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
                    start_time: startTime,
                    end_time: endTime
                  }];
                  
                  processedRow.schedule = manualSchedule;
                  console.log(`Interpreted schedule as text: ${day} ${startTime}-${endTime}`);
                } else {
                  console.warn(`Could not interpret schedule text, setting empty schedule`);
                  processedRow.schedule = [];
                }
              }
            } else if (Array.isArray(processedRow.schedule)) {
              // Already an array, normalize the time slots
              const normalizedSchedule = processedRow.schedule.map((slot: any) => {
                if (typeof slot === 'object' && slot !== null) {
                  // Extract day and times with various possible property names
                  const day = slot.day || slot.Day || '';
                  const startTime = slot.start_time || slot.startTime || slot['start time'] || slot['Start Time'] || slot['Start time'] || '';
                  const endTime = slot.end_time || slot.endTime || slot['end time'] || slot['End Time'] || slot['End time'] || '';
                  
                  return {
                    day: String(day).trim(),
                    start_time: String(startTime).trim(),
                    end_time: String(endTime).trim()
                  };
                }
                return null;
              }).filter(Boolean);
              
              processedRow.schedule = normalizedSchedule;
              console.log(`Normalized schedule array to ${normalizedSchedule.length} time slots`);
            } else if (typeof processedRow.schedule === 'object' && processedRow.schedule !== null) {
              // Single object, wrap in array and normalize
              const day = processedRow.schedule.day || processedRow.schedule.Day || '';
              const startTime = processedRow.schedule.start_time || processedRow.schedule.startTime || '';
              const endTime = processedRow.schedule.end_time || processedRow.schedule.endTime || '';
              
              if (day && startTime && endTime) {
                processedRow.schedule = [{
                  day: String(day).trim(),
                  start_time: String(startTime).trim(),
                  end_time: String(endTime).trim()
                }];
                console.log(`Converted object schedule to array with 1 time slot`);
              } else {
                processedRow.schedule = [];
                console.warn(`Schedule object missing required fields, setting empty schedule`);
              }
            } else {
              console.warn(`Unhandled schedule format, setting empty schedule`);
              processedRow.schedule = [];
            }
          } catch (e) {
            console.error(`Error processing schedule, setting empty schedule:`, e);
            processedRow.schedule = [];
          }
        } else {
          // No schedule provided
          processedRow.schedule = [];
          console.log(`No schedule provided, set to empty array`);
        }
        
        // Final check on schedule format
        if (Array.isArray(processedRow.schedule) && processedRow.schedule.length > 0) {
          const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          
          // Validate each schedule slot
          const validatedSchedule = processedRow.schedule.filter((slot: any) => {
            if (!slot || typeof slot !== 'object') return false;
            
            // Extract day and times with various possible property names
            const day = slot.day;
            const startTime = slot.start_time || slot.startTime;
            const endTime = slot.end_time || slot.endTime;
            
            // Check day is valid
            const validDay = day && typeof day === 'string' && validDays.includes(day);
            // Check times are valid
            const validStartTime = startTime && typeof startTime === 'string' && timeRegex.test(startTime);
            const validEndTime = endTime && typeof endTime === 'string' && timeRegex.test(endTime);
            
            if (!validDay || !validStartTime || !validEndTime) {
              console.warn(`Invalid schedule slot:`, { day, startTime, endTime });
              return false;
            }
            
            // Use the correct property names for the database
            slot.start_time = startTime;
            slot.end_time = endTime;
            
            return true;
          });
          
          if (validatedSchedule.length < processedRow.schedule.length) {
            console.warn(`Removed ${processedRow.schedule.length - validatedSchedule.length} invalid schedule slots`);
          }
          
          processedRow.schedule = validatedSchedule;
          console.log(`Final validated schedule: ${validatedSchedule.length} slots`);
        }
        
        // Ensure numeric fields are proper numbers
        ['credits', 'semester'].forEach(field => {
          if (processedRow[field] !== undefined && processedRow[field] !== null) {
            console.log(`Original ${field} (${typeof processedRow[field]}):`, processedRow[field]);
            
            // Convert to number if it's a string
            if (typeof processedRow[field] === 'string') {
              const numericValue = parseFloat(processedRow[field].replace(/[^\d.-]/g, ''));
              if (!isNaN(numericValue)) {
                processedRow[field] = numericValue;
                console.log(`Converted ${field} to number:`, processedRow[field]);
              }
            } 
            // Handle Excel date serial numbers
            else if (typeof processedRow[field] === 'number' && field === 'semester' && processedRow[field] > 8) {
              const mod10 = Math.round(processedRow[field]) % 10;
              if (mod10 >= 1 && mod10 <= 8) {
                processedRow[field] = mod10;
                console.log(`Fixed Excel date serial for ${field}:`, processedRow[field]);
              }
            }
          }
        });
        
        return processedRow;
      });
      
      console.log("=== EXCEL PRE-PROCESSING COMPLETE ===");

      try {
        // Process and validate the Excel data
        const courses = await processExcelData(preprocessedData, session.user.id);

        // Get all course codes from the Excel file
        const courseCodes = courses.map(course => course.code);
        
        // Check which courses already exist in the database
        const existing = await checkExistingCourses(courseCodes);
        const newCourseCodes = courseCodes.filter(code => !existing.includes(code));
        
        setProcessedCourses(courses);
        setExistingCourses(existing);
        setNewCourses(newCourseCodes);
        
        console.log(`Found ${existing.length} existing courses and ${newCourseCodes.length} new courses`);
        
        // Initialize custom selection (default to update all existing courses)
        const initialCustomSelection: Record<string, boolean> = {};
        existing.forEach(code => {
          initialCustomSelection[code] = true;
        });
        setCustomSelection(initialCustomSelection);
        
        // Open confirmation modal if there are any courses to process
        if (courses.length > 0) {
          setVerificationModal(true);
        } else {
          toast({
            title: 'No valid courses found',
            description: 'The Excel file does not contain any valid courses to upload.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error validating course data:', error);
        toast({
          title: 'Validation Error',
          description: error instanceof Error ? error.message : 'An error occurred while validating courses',
          status: 'error',
          duration: 10000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read the Excel file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // New function to handle the actual upload after confirmation
  const processCourseUpload = async () => {
    setVerificationModal(false);
    setUploading(true);
    
    try {
      // Filter courses based on selection
      let coursesToUpload: ProcessedCourse[] = [];
      
      if (selectedAction === 'update_all') {
        // Upload all courses (update existing + add new)
        coursesToUpload = processedCourses;
      } else if (selectedAction === 'add_new_only') {
        // Only add new courses, filter out existing ones
        coursesToUpload = processedCourses.filter(course => !existingCourses.includes(course.code));
      } else if (selectedAction === 'custom') {
        // Custom selection: add new courses + selected existing courses for update
        coursesToUpload = processedCourses.filter(course => 
          !existingCourses.includes(course.code) || // all new courses
          (existingCourses.includes(course.code) && customSelection[course.code]) // selected existing courses
        );
      }
      
      console.log(`=== STARTING DATABASE UPLOAD OF ${coursesToUpload.length} COURSES ===`);
      
      // Debug log for exact format being sent
      if (coursesToUpload.length > 0) {
        const sampleCourse = coursesToUpload[0];
        console.log("SAMPLE COURSE FORMAT:", {
          code: sampleCourse.code,
          prerequisites_type: sampleCourse.prerequisites ? 
            `${typeof sampleCourse.prerequisites} (${Array.isArray(sampleCourse.prerequisites) ? 'array' : 'not array'})` : 'null',
          prerequisites: JSON.stringify(sampleCourse.prerequisites),
          anti_requisites_type: sampleCourse.anti_requisites ? 
            `${typeof sampleCourse.anti_requisites} (${Array.isArray(sampleCourse.anti_requisites) ? 'array' : 'not array'})` : 'null',
          anti_requisites: JSON.stringify(sampleCourse.anti_requisites),
          schedule_type: sampleCourse.schedule ? 
            `${typeof sampleCourse.schedule} (${Array.isArray(sampleCourse.schedule) ? 'array' : 'not array'})` : 'null',
          schedule: JSON.stringify(sampleCourse.schedule)
        });
      }

      // Make sure all courses have proper array format for prerequisites, anti-requisites, and schedule
      coursesToUpload = coursesToUpload.map(course => {
        // Ensure prerequisites is an array
        let prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];
        if (prerequisites.length > 0) {
          // Make sure all items are strings
          prerequisites = prerequisites.map(p => String(p).trim()).filter(Boolean);
        }
        
        // Ensure anti-requisites is an array
        let antiRequisites = Array.isArray(course.anti_requisites) ? course.anti_requisites : [];
        if (antiRequisites.length > 0) {
          // Make sure all items are strings
          antiRequisites = antiRequisites.map(a => String(a).trim()).filter(Boolean);
        }
        
        // Ensure schedule is an array with proper TimeSlot objects
        let schedule = Array.isArray(course.schedule) ? course.schedule : [];
        if (schedule.length > 0) {
          // Make sure all items have the proper structure
          schedule = schedule.map(slot => ({
            day: slot.day,
            start_time: slot.start_time,
            end_time: slot.end_time
          }));
        }

        return {
          ...course,
          prerequisites,
          anti_requisites: antiRequisites,
          schedule
        };
      });
      
      // Use direct upload instead of deep cloning to avoid reference issues
      const uploadedCourses: string[] = [];
      const batchSize = 1; // Upload one at a time to minimize errors
      let successCount = 0;
      let errorCount = 0;
      
      // Process courses one by one
      for (let i = 0; i < coursesToUpload.length; i++) {
        const course = coursesToUpload[i];
        console.log(`\n=== Processing course ${i+1}/${coursesToUpload.length}: ${course.code} ===`);
        
        try {
          // Log the exact data being sent to Supabase
          console.log(`Course ${course.code} payload:`, {
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
            stream_id: course.stream_id,
            semester: course.semester,
            prerequisites: course.prerequisites?.length ? `${course.prerequisites.length} items` : '[]',
            anti_requisites: course.anti_requisites?.length ? `${course.anti_requisites.length} items` : '[]',
            schedule: course.schedule?.length ? `${course.schedule.length} slots` : '[]',
          });
          
          if (course.schedule && course.schedule.length > 0) {
            console.log(`First schedule slot: ${JSON.stringify(course.schedule[0])}`);
          }
          
          // Explicitly format the data for Supabase
          const supabaseReadyData = {
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
            stream_id: course.stream_id,
            semester: course.semester,
            description: course.description,
            instructor: course.instructor,
            department: course.department,
            status: course.status,
            prerequisites: course.prerequisites || [], // Ensure it's an array
            anti_requisites: course.anti_requisites || [], // Ensure it's an array
            schedule: course.schedule || [], // Ensure it's an array
            created_by: course.created_by,
            updated_by: course.updated_by
          };
          
          // Use upsert to add or update
        const { data, error } = await supabase
          .from('courses')
            .upsert(supabaseReadyData, { 
              onConflict: 'id'
            });

        if (error) {
            console.error(`Error upserting course ${course.code}:`, error);
            errorCount++;
            setResults(prev => ({
              ...prev,
              errors: [...prev.errors, `Failed to add/update ${course.code}: ${error.message || 'Server error'}`]
            }));
        } else {
            console.log(`Successfully upserted course ${course.code}`);
            successCount++;
            uploadedCourses.push(course.code);
            setResults(prev => ({
              ...prev,
              success: [...prev.success, `Successfully ${existingCourses.includes(course.code) ? 'updated' : 'added'} ${course.code}`]
            }));
            
            // Verify that the data was saved correctly
            const { data: verifyData, error: verifyError } = await supabase
              .from('courses')
              .select('code, schedule, prerequisites, anti_requisites')
              .eq('code', course.code)
              .single();
              
            if (verifyError) {
              console.warn(`Verification failed for ${course.code}:`, verifyError);
            } else if (verifyData) {
              console.log(`=== Verification details for ${course.code} ===`);
              
              // Check prerequisites
              if (verifyData.prerequisites) {
                console.log(`Prerequisites: ${Array.isArray(verifyData.prerequisites) ? 'ARRAY' : 'NOT ARRAY'}`);
                console.log(`Prerequisites length: ${Array.isArray(verifyData.prerequisites) ? verifyData.prerequisites.length : 'N/A'}`);
                console.log(`Prerequisites data:`, verifyData.prerequisites);
              } else {
                console.log(`Prerequisites: NULL or EMPTY`);
              }
              
              // Check anti-requisites
              if (verifyData.anti_requisites) {
                console.log(`Anti-requisites: ${Array.isArray(verifyData.anti_requisites) ? 'ARRAY' : 'NOT ARRAY'}`);
                console.log(`Anti-requisites length: ${Array.isArray(verifyData.anti_requisites) ? verifyData.anti_requisites.length : 'N/A'}`);
                console.log(`Anti-requisites data:`, verifyData.anti_requisites);
              } else {
                console.log(`Anti-requisites: NULL or EMPTY`);
              }
              
              // Check schedule
              if (verifyData.schedule) {
                console.log(`Schedule: ${Array.isArray(verifyData.schedule) ? 'ARRAY' : 'NOT ARRAY'}`);
                console.log(`Schedule length: ${Array.isArray(verifyData.schedule) ? verifyData.schedule.length : 'N/A'}`);
                console.log(`Schedule data:`, JSON.stringify(verifyData.schedule));
                
                // If there are schedule entries, check the format of the first one
                if (Array.isArray(verifyData.schedule) && verifyData.schedule.length > 0) {
                  const firstSlot = verifyData.schedule[0];
                  console.log(`First schedule slot: ${JSON.stringify(firstSlot)}`);
                  
                  // Verify the slot has all required fields
                  if (firstSlot) {
                    console.log(`- day: ${firstSlot.day || 'MISSING'}`);
                    console.log(`- start_time: ${firstSlot.start_time || 'MISSING'}`);
                    console.log(`- end_time: ${firstSlot.end_time || 'MISSING'}`);
                  }
                }
              } else {
                console.log(`Schedule: NULL or EMPTY`);
              }
              
              console.log(`All verification checks completed for ${course.code}`);
            }
          }
        } catch (error) {
          console.error(`Error processing course ${course.code}:`, error);
          errorCount++;
          setResults(prev => ({
            ...prev,
            errors: [...prev.errors, `Failed to add/update ${course.code}: ${error instanceof Error ? error.message : 'Unknown error'}`]
          }));
        }
        
        // Update progress
        setProgress(((i + 1) / coursesToUpload.length) * 100);
      }
      
      // Store the uploaded course IDs in session storage for potential rollback
      if (uploadedCourses.length > 0) {
        const existingUploads = JSON.parse(sessionStorage.getItem('uploadedCourses') || '[]');
        sessionStorage.setItem('uploadedCourses', JSON.stringify([...existingUploads, ...uploadedCourses]));
        
        // Verify the uploaded courses
        await verifyUploadedCourses(uploadedCourses);
      }
      
      console.log(`=== UPLOAD COMPLETE: ${successCount} successful, ${errorCount} failed ===`);

      toast({
        title: 'Upload Complete',
        description: `Successfully processed ${successCount} courses with ${errorCount} errors`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading courses:', error);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred during upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Toggle custom selection for a specific course
  const toggleCourseSelection = (code: string) => {
    setCustomSelection(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Toggle all courses in custom selection
  const toggleAllCourses = (selected: boolean) => {
    const newSelection: Record<string, boolean> = {};
    existingCourses.forEach(code => {
      newSelection[code] = selected;
    });
    setCustomSelection(newSelection);
  };

  // Cancel verification and reset
  const cancelVerification = () => {
    setVerificationModal(false);
    setProcessedCourses([]);
    setExistingCourses([]);
    setNewCourses([]);
  };

  // Add function to delete uploaded courses
  const deleteUploadedCourses = async () => {
    try {
      setUploading(true);
      
      // Get courses uploaded in this session
      const uploadedCourses = JSON.parse(sessionStorage.getItem('uploadedCourses') || '[]');
      
      if (uploadedCourses.length === 0) {
        toast({
          title: 'No courses to delete',
          description: 'No courses have been uploaded in this session',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setUploading(false);
        return;
      }
      
      // Confirm before deletion
      if (!window.confirm(`Are you sure you want to delete ${uploadedCourses.length} uploaded courses? This action cannot be undone.`)) {
        setUploading(false);
        return;
      }
      
      // Delete courses in smaller batches
      const batchSize = 20;
      let deletedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < uploadedCourses.length; i += batchSize) {
        const batch = uploadedCourses.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from('courses')
            .delete()
            .in('code', batch);
            
          if (error) {
            console.error('Error deleting courses:', error);
            errorCount += batch.length;
          } else {
            deletedCount += batch.length;
          }
          
          setProgress(((i + batch.length) / uploadedCourses.length) * 100);
        } catch (error) {
          console.error('Error in batch delete:', error);
          errorCount += batch.length;
        }
      }
      
      // Clear the session storage
      sessionStorage.removeItem('uploadedCourses');
      
      toast({
        title: 'Deletion Complete',
        description: `Successfully deleted ${deletedCount} courses with ${errorCount} errors`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setResults({ success: [], errors: [] });
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete courses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Add a new verification function to check uploaded courses
  const verifyUploadedCourses = async (courseCodes: string[]) => {
    if (!courseCodes.length) return;
    
    console.log(`=== VERIFYING ${courseCodes.length} UPLOADED COURSES ===`);
    
    // Take a sample of courses to verify (max 5)
    const sampleSize = Math.min(courseCodes.length, 5);
    const sampleCodes = courseCodes.slice(0, sampleSize);
    
    for (const code of sampleCodes) {
      try {
        console.log(`\nVerifying upload for course: ${code}`);
        
        const { data, error } = await supabase
          .from('courses')
          .select('*') // Select all fields for detailed verification
          .eq('code', code)
          .single();
          
        if (error) {
          console.warn(`Verification failed for ${code}:`, error);
        } else if (data) {
          console.log(`=== Verification details for ${code} ===`);
          
          // Check prerequisites
          if (data.prerequisites) {
            console.log(`Prerequisites: ${Array.isArray(data.prerequisites) ? 'ARRAY' : 'NOT ARRAY'}`);
            console.log(`Prerequisites length: ${Array.isArray(data.prerequisites) ? data.prerequisites.length : 'N/A'}`);
            console.log(`Prerequisites data:`, data.prerequisites);
          } else {
            console.log(`Prerequisites: NULL or EMPTY`);
          }
          
          // Check anti-requisites
          if (data.anti_requisites) {
            console.log(`Anti-requisites: ${Array.isArray(data.anti_requisites) ? 'ARRAY' : 'NOT ARRAY'}`);
            console.log(`Anti-requisites length: ${Array.isArray(data.anti_requisites) ? data.anti_requisites.length : 'N/A'}`);
            console.log(`Anti-requisites data:`, data.anti_requisites);
          } else {
            console.log(`Anti-requisites: NULL or EMPTY`);
          }
          
          // Check schedule
          if (data.schedule) {
            console.log(`Schedule: ${Array.isArray(data.schedule) ? 'ARRAY' : 'NOT ARRAY'}`);
            console.log(`Schedule length: ${Array.isArray(data.schedule) ? data.schedule.length : 'N/A'}`);
            console.log(`Schedule data:`, JSON.stringify(data.schedule));
            
            // If there are schedule entries, check the format of the first one
            if (Array.isArray(data.schedule) && data.schedule.length > 0) {
              const firstSlot = data.schedule[0];
              console.log(`First schedule slot: ${JSON.stringify(firstSlot)}`);
              
              // Verify the slot has all required fields
              if (firstSlot) {
                console.log(`- day: ${firstSlot.day || 'MISSING'}`);
                console.log(`- start_time: ${firstSlot.start_time || 'MISSING'}`);
                console.log(`- end_time: ${firstSlot.end_time || 'MISSING'}`);
              }
            }
          } else {
            console.log(`Schedule: NULL or EMPTY`);
          }
          
          console.log(`All verification checks completed for ${code}`);
        }
      } catch (verifyError) {
        console.warn(`Verification error for ${code}:`, verifyError);
      }
    }
    
    console.log(`=== VERIFICATION COMPLETE ===`);
  };

  return (
    <Box p={8} maxWidth="1200px" mx="auto" bgGradient="linear(to-br, purple.50, blue.50)">
      <VStack
        spacing={8}
        align="stretch"
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
      >
        <HStack justify="space-between" align="center">
          <Heading size="lg" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Bulk Course Upload
          </Heading>
          <Button
            as="a"
            href="/admin"
            colorScheme="gray"
            leftIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </HStack>

        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Upload Format Instructions</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={4}>
                <Text>
                  Download the template below and fill in your course data following these guidelines:
                </Text>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Field</Th>
                      <Th>Format</Th>
                      <Th>Example</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>code</Td>
                      <Td>String</Td>
                      <Td>CS101</Td>
                    </Tr>
                    <Tr>
                      <Td>credits</Td>
                      <Td>Number</Td>
                      <Td>4</Td>
                    </Tr>
                    <Tr>
                      <Td>stream_id</Td>
                      <Td>UUID</Td>
                      <Td>Get from streams table</Td>
                    </Tr>
                    <Tr>
                      <Td>status</Td>
                      <Td>String</Td>
                      <Td>active, inactive, or archived</Td>
                    </Tr>
                    <Tr>
                      <Td>prerequisites</Td>
                      <Td>Comma-separated</Td>
                      <Td>MATH101,PHY101</Td>
                    </Tr>
                    <Tr>
                      <Td>schedule</Td>
                      <Td>JSON string</Td>
                      <Td>See template</Td>
                    </Tr>
                  </Tbody>
                </Table>
                <Text color="red.500" fontWeight="bold">
                  Important: Make sure all semester and credits values are numbers, not text.
                </Text>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  onClick={downloadTemplate}
                  size="sm"
                >
                  Download Template
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Text>
          Upload an Excel file containing multiple courses. Make sure to follow the template format.
        </Text>

        <HStack spacing={4}>
        <Button
          as="label"
          htmlFor="file-upload"
          colorScheme="purple"
          size="lg"
          cursor="pointer"
            isLoading={isVerifying || uploading}
        >
          Choose Excel File
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            display="none"
            title="Upload Excel File"
            aria-label="Upload Excel File"
          />
        </Button>
          
          <Button
            colorScheme="red"
            size="lg"
            onClick={deleteUploadedCourses}
            isLoading={uploading}
            isDisabled={isVerifying}
          >
            Delete Uploaded Courses
          </Button>
        </HStack>

        {isVerifying && (
          <HStack spacing={2} justify="center">
            <Spinner size="sm" />
            <Text>Verifying courses...</Text>
          </HStack>
        )}

        {uploading && (
          <Progress
            value={progress}
            size="sm"
            colorScheme="purple"
            hasStripe
            isAnimated
          />
        )}

        {(results.success.length > 0 || results.errors.length > 0) && (
          <VStack align="stretch" spacing={4}>
            {results.success.length > 0 && (
              <Box>
                <Heading size="sm" mb={2}>Successfully Processed ({results.success.length}):</Heading>
                <List spacing={2} maxH="300px" overflowY="auto" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                {results.success.map((msg, i) => (
                  <ListItem key={i}>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    {msg}
                  </ListItem>
                ))}
              </List>
              </Box>
            )}

            {results.errors.length > 0 && (
              <Box>
                <Heading size="sm" mb={2} color="red.500">Errors ({results.errors.length}):</Heading>
                <List spacing={2} maxH="300px" overflowY="auto" p={2} border="1px" borderColor="red.200" borderRadius="md">
                {results.errors.map((msg, i) => (
                  <ListItem key={i} color="red.500">
                    <ListIcon as={WarningIcon} color="red.500" />
                    {msg}
                  </ListItem>
                ))}
              </List>
              </Box>
            )}
          </VStack>
        )}
        
        {/* Course Verification Modal */}
        <Modal 
          isOpen={verificationModal} 
          onClose={cancelVerification}
          size="xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Verify Courses</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  Your file contains <Badge colorScheme="blue">{processedCourses.length}</Badge> courses:
                </Text>
                
                <Flex justify="space-between">
                  <Badge colorScheme="green" p={2} borderRadius="md">
                    <AddIcon mr={1} /> {newCourses.length} new courses to add
                  </Badge>
                  <Badge colorScheme="orange" p={2} borderRadius="md">
                    <RepeatIcon mr={1} /> {existingCourses.length} existing courses to update
                  </Badge>
                </Flex>
                
                <Divider />
                
                <Text fontWeight="bold">How would you like to proceed?</Text>
                
                <Tabs isFitted variant="enclosed" onChange={(index) => {
                  setSelectedAction(index === 0 ? 'update_all' : index === 1 ? 'add_new_only' : 'custom');
                }}>
                  <TabList>
                    <Tab>Update All</Tab>
                    <Tab>Add New Only</Tab>
                    <Tab>Custom Selection</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <Text>
                        This will add {newCourses.length} new courses and update {existingCourses.length} existing courses.
                      </Text>
                    </TabPanel>
                    
                    <TabPanel>
                      <Text>
                        This will only add {newCourses.length} new courses. No existing courses will be updated.
                      </Text>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Select courses to update:</Text>
                          <HStack spacing={2}>
                            <Button size="xs" onClick={() => toggleAllCourses(true)}>Select All</Button>
                            <Button size="xs" onClick={() => toggleAllCourses(false)}>Deselect All</Button>
                          </HStack>
                        </HStack>
                        
                        {existingCourses.length > 0 ? (
                          <Box maxH="300px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                            <Table size="sm" variant="simple">
                              <Thead>
                                <Tr>
                                  <Th>Update</Th>
                                  <Th>Course Code</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {existingCourses.map(code => (
                                  <Tr key={code}>
                                    <Td>
                                      <Checkbox 
                                        isChecked={customSelection[code]} 
                                        onChange={() => toggleCourseSelection(code)}
                                      />
                                    </Td>
                                    <Td>{code}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        ) : (
                          <Text>No existing courses found to update.</Text>
                        )}
                        
                        <Text>
                          This will add {newCourses.length} new courses and update {
                            Object.entries(customSelection).filter(([_, selected]) => selected).length
                          } of {existingCourses.length} existing courses.
                        </Text>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button onClick={cancelVerification} variant="outline">Cancel</Button>
                <Button 
                  colorScheme="green" 
                  onClick={processCourseUpload}
                  isDisabled={selectedAction === 'custom' && 
                    existingCourses.length > 0 && 
                    Object.entries(customSelection).filter(([_, selected]) => selected).length === 0 &&
                    newCourses.length === 0}
                >
                  Proceed with Upload
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default BulkCourseUpload; 