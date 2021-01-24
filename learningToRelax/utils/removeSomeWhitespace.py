# LOW RES TEAPOT

lowResFile = open("modelObjFiles/lowResUtahTeapot.txt", "r")
annoyinglyLargeString1 = ""

try:
    while True:
        line = lowResFile.readline()
        if not line:
            break
        else:
            if line[0] != "f":
                annoyinglyLargeString1 += line
            elif line[0] == "f":
                # get rid of that pesky whitespace
                # with zero index, range(len(line) - 1) is the whole string
                correctedLine = ""
                char = ""
                for i in range(len(line) - 2):
                    char += line[i]
                correctedLine += char
                correctedLine += "\n"
                annoyinglyLargeString1 += correctedLine
                    
                    
finally:
    lowResFile.close()

# some nice, convoluted code
try:
    f = open("modelObjFiles/lowResUtahTeapot.txt", "w")
    f.write(annoyinglyLargeString1)
finally:
    f.close()

# HIGH RES TEAPOT
highResFile = open("modelObjFiles/highResUtahTeapot.txt", "r")
annoyinglyLargeString2 = ""

try:
    while True:
        line = highResFile.readline()
        if not line:
            break
        else:
            if line[0] != "f":
                annoyinglyLargeString2 += line
            elif line[0] == "f":
                # get rid of that pesky whitespace
                # with zero index, range(len(line) - 1) is the whole string
                correctedLine = ""
                char = ""
                for i in range(len(line) - 2):
                    char += line[i]
                correctedLine += char
                correctedLine += "\n"
                annoyinglyLargeString2 += correctedLine
                                       
finally:
    highResFile.close()

# some nice, convoluted code
try:
    f = open("modelObjFiles/highResUtahTeapot.txt", "w")
    f.write(annoyinglyLargeString2)
finally:
    f.close()