import React from "react";

function NoFile() {
    return (
        <div className="p-6 bg-secondary rounded shadow-sm border">
            <p className="text-center text-muted-foreground">No file available. Please select a file to upload.</p>
        </div>
    );
}

export default NoFile;