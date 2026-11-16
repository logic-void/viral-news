/*
  THE DAILY HER — FRONT PAGE SETTINGS

  Add the exact starting date/time below when you have it.
  Format: YYYY-MM-DDTHH:mm:ss (your local time).
  Example format only: "2024-08-28T18:30:00"
  If you know only the date, use midnight: "YYYY-MM-DDT00:00:00".
*/
const RELATIONSHIP_START = "2024-08-28T17:30:27";

const dateElement = document.getElementById("edition-date");
const today = new Date();
if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    })
        .format(today)
        .toUpperCase();
}

const counterIds = ["years", "months", "days", "hours", "minutes", "seconds"];
const clockNote = document.getElementById("clock-note");

function setCounter(values) {
    counterIds.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) element.textContent = values[index];
    });
}

// Adds calendar months without allowing dates such as January 31 to roll into March.
function addMonthsClamped(date, amount) {
    const result = new Date(date);
    const originalDay = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + amount);
    const finalDay = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
    ).getDate();
    result.setDate(Math.min(originalDay, finalDay));
    return result;
}

function getCalendarAge(start, now) {
    let years = now.getFullYear() - start.getFullYear();
    let yearAnchor = addMonthsClamped(start, years * 12);
    if (yearAnchor > now) {
        years -= 1;
        yearAnchor = addMonthsClamped(start, years * 12);
    }

    let months =
        (now.getFullYear() - yearAnchor.getFullYear()) * 12 +
        (now.getMonth() - yearAnchor.getMonth());
    let monthAnchor = addMonthsClamped(yearAnchor, months);
    if (monthAnchor > now) {
        months -= 1;
        monthAnchor = addMonthsClamped(yearAnchor, months);
    }

    let remainingMs = now.getTime() - monthAnchor.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const days = Math.floor(remainingMs / oneDay);
    remainingMs -= days * oneDay;

    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    remainingMs -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(remainingMs / (60 * 1000));
    remainingMs -= minutes * 60 * 1000;
    const seconds = Math.floor(remainingMs / 1000);

    return [years, months, days, hours, minutes, seconds];
}

function updateRelationshipClock() {
    if (!RELATIONSHIP_START) {
        setCounter(["—", "—", "—", "—", "—", "—"]);
        if (clockNote) {
            clockNote.textContent =
                "The archive has received the story. Its exact starting timestamp is awaiting confirmation.";
        }
        return;
    }

    const start = new Date(RELATIONSHIP_START);
    if (Number.isNaN(start.getTime())) {
        setCounter(["!", "!", "!", "!", "!", "!"]);
        if (clockNote)
            clockNote.textContent =
                "The archive date needs checking. Please use YYYY-MM-DDTHH:mm:ss.";
        return;
    }

    const now = new Date();
    if (start > now) {
        setCounter(["—", "—", "—", "—", "—", "—"]);
        if (clockNote)
            clockNote.textContent =
                "The archive's starting timestamp is in the future. Please check the date and time.";
        return;
    }

    setCounter(getCalendarAge(start, now));
    if (clockNote) {
        clockNote.textContent =
            "Calculated live from the date this story began.";
    }
}

updateRelationshipClock();
window.setInterval(updateRelationshipClock, 1000);

// The final personal note is deliberately separate from the newspaper pages.
// It remains on this device/browser through localStorage when available.
const personalNote = document.getElementById("personal-note");
const personalNoteStatus = document.getElementById("personal-note-status");
const PERSONAL_NOTE_KEY = "the-daily-her-final-note";

if (personalNote) {
    try {
        personalNote.value =
            window.localStorage.getItem(PERSONAL_NOTE_KEY) || "";
    } catch (error) {
        if (personalNoteStatus) {
            personalNoteStatus.textContent =
                "This browser does not allow local saving; copy your note before closing.";
        }
    }

    personalNote.addEventListener("input", () => {
        try {
            window.localStorage.setItem(PERSONAL_NOTE_KEY, personalNote.value);
            if (personalNoteStatus) {
                personalNoteStatus.textContent = "Saved on this device.";
            }
        } catch (error) {
            if (personalNoteStatus) {
                personalNoteStatus.textContent =
                    "Could not save automatically. Copy your note before closing.";
            }
        }
    });
}
